const TelegramApi = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const {
    getNextThreeMonths,
    getDaysInMonth,
    getMonthNameByIndex,
    compareDays,
    calculateTimeDifference,
} = require("./options");
const {
    addArrayInAllBookings,
    getAllArraysFromAllBookings,
    removeLastElementFromAllBookings,
} = require("./controller.js");
const User = require("./type.js");

const token = "6708291526:AAHd4XetD-hyE_t_dwybEd1b3iBfRhKbuMQ";
const DB_URL =
    "mongodb+srv://user:user@clustertest.9vlpsvz.mongodb.net/?retryWrites=true&w=majority";

const bot = new TelegramApi(token, { polling: true });

const start = async () => {
    bot.setMyCommands([{ command: "/start", description: "Приветствие" }]);
    mongoose
        .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Успешное подключение к MongoDB"))
        .catch((err) => console.error("Ошибка подключения к MongoDB", err));

    let userChoices = {};
    bot.on("message", async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === "/start") {
            await bot.sendMessage(chatId, `Привет ${msg.from.first_name}`);
            await bot.sendMessage(chatId, "Выбери команду:", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "ВЫБРАТЬ ВРЕМЯ", callback_data: "choose_time" }],
                        [{ text: "О НАС", callback_data: "about_us" }],
                    ],
                },
            });
        } else {
            return bot.sendMessage(chatId, "Не понял команду");
        }
    });

    bot.on("callback_query", async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (!userChoices[chatId]) {
            userChoices[chatId] = { month: "", day: "", time: "", duration: "" };
        }

        if (data === "about_us") {
            return bot.sendMessage(chatId, "МЫ КРУТОЕ ПРОСТРАНСТВО");
        }

        if (data === "choose_time") {
            const currentMonth = new Date().getMonth();
            const months = getNextThreeMonths();
            const monthOptions = {
                reply_markup: JSON.stringify({
                    inline_keyboard: months.map((month, index) => {
                        let monthIndex = currentMonth + index;
                        if (monthIndex > 11) {
                            monthIndex -= 12;
                        }

                        return [{ text: month, callback_data: `month_${monthIndex}` }];
                    }),
                }),
            };
            return bot.sendMessage(chatId, "Выбери месяц:", monthOptions);
        }
        if (data.startsWith("month_")) {
            const monthIndex = parseInt(data.split("_")[1]);
            const year = new Date().getFullYear();
            const daysInMonth = getDaysInMonth(monthIndex + 1, year);

            if (userChoices[chatId]) {
                userChoices[chatId].month = monthIndex;
            }

            const dayButtons = [];
            let currentRow = [];

            for (let day = 1; day <= daysInMonth; day++) {
                currentRow.push({ text: `${day}`, callback_data: `day_${day}_${monthIndex}` });

                if (currentRow.length === 7 || day === daysInMonth) {
                    dayButtons.push(currentRow);
                    currentRow = [];
                }
            }

            const dayOptions = {
                reply_markup: JSON.stringify({
                    inline_keyboard: dayButtons,
                }),
            };

            return bot.sendMessage(chatId, "Выбери день:", dayOptions);
        }

        if (data.startsWith("day_")) {
            const day = parseInt(data.split("_")[1]);

            if (userChoices[chatId]) {
                userChoices[chatId].day = day;
            }

            const currentChoiseBook = [
                userChoices[chatId].month,
                userChoices[chatId].day,
                // parseInt(userChoices[chatId].time.split(":")[0], 10),
            ];

            const timeButtons = [];
            let currentRow = [];

            const compareDaysResult = await compareDays(
                currentChoiseBook,
                getAllArraysFromAllBookings
            );
            console.log(compareDaysResult);

            for (let hour = 9; hour < 22; hour++) {
                const time = `${hour}:00`;
                if (!compareDaysResult.includes(time)) {
                    currentRow.push({ text: time, callback_data: `time_${time}` });

                    if (currentRow.length === 4) {
                        timeButtons.push(currentRow);
                        currentRow = [];
                    }
                }
            }

            if (currentRow.length > 0) {
                timeButtons.push(currentRow);
            }

            const timeOptions = {
                reply_markup: JSON.stringify({
                    inline_keyboard: timeButtons,
                }),
            };

            return bot.sendMessage(chatId, "Выбери время начала мероприятия:", timeOptions);
        }
        if (data.startsWith("time_")) {
            const time = data.split("_")[1];

            if (userChoices[chatId]) {
                userChoices[chatId].time = time;
            }

            const currentChoiseBook = [
                userChoices[chatId].month,
                userChoices[chatId].day,
                // parseInt(userChoices[chatId].time.split(":")[0], 10),
            ];

            const compareDaysResult = await compareDays(
                currentChoiseBook,
                getAllArraysFromAllBookings
            );

            const timeDifference = calculateTimeDifference(time, compareDaysResult);

            const durationButtons = [];

            let currentRow = [];

            for (let i = 1; i <= timeDifference; i++) {
                currentRow.push({ text: `${i} ч`, callback_data: `duration_${i}` });

                if (currentRow.length === 6) {
                    durationButtons.push(currentRow);
                    currentRow = [];
                }
            }

            if (currentRow.length > 0) {
                durationButtons.push(currentRow);
            }

            const durationOptions = {
                reply_markup: JSON.stringify({
                    inline_keyboard: durationButtons,
                }),
            };

            return bot.sendMessage(
                chatId,
                "Выбери продолжительность мероприятия:",
                durationOptions
            );
        }

        if (data.startsWith("duration_")) {
            const duration = parseInt(data.split("_")[1]);

            if (userChoices[chatId]) {
                userChoices[chatId].duration = duration;
                const monthName = getMonthNameByIndex(userChoices[chatId].month);

                // const bookingsArray = [
                //     userChoices[chatId].month,
                //     userChoices[chatId].day,
                //     parseInt(userChoices[chatId].time.split(":")[0], 10),
                //     duration,
                // ];

                // addArrayInAllBookings(bookingsArray);

                return bot.sendMessage(
                    chatId,
                    `Ты выбрал: Месяц - ${monthName}, День - ${userChoices[chatId].day}, Время начала - ${userChoices[chatId].time}, Продолжительность - ${duration} час(а)`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Все верно?", callback_data: "ok" }],
                                [{ text: "Нет, неверно", callback_data: "choose_time" }],
                            ],
                        },
                    }
                );
            }
        }

        if (data === "ok") {
            const bookingsArray = [
                userChoices[chatId].month,
                userChoices[chatId].day,
                parseInt(userChoices[chatId].time.split(":")[0], 10),
                userChoices[chatId].duration,
            ];

            addArrayInAllBookings(bookingsArray);

            // Отправляем сообщение о подтверждении брони
            return bot.sendMessage(chatId, "Бронь прошла, спасибо!");
        }

        return bot.sendMessage(chatId, "Не понял команду");
    });
};

start();

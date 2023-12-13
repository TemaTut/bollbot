function getNextThreeMonths() {
    const currentMonth = new Date();
    let monthNames = [];

    for (let i = 0; i < 3; i++) {
        monthNames.push(currentMonth.toLocaleString("ru-RU", { month: "long" }));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    return monthNames;
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function getMonthNameByIndex(index) {
    const date = new Date();
    date.setMonth(index);
    return date.toLocaleString("ru-RU", { month: "long" });
}

async function compareArrays(currentBookArray, getAllArraysFunction) {
    try {
        // Получаем массив allBookingArrays с помощью функции getAllArraysFunction
        const allBookingArrays = await getAllArraysFunction();

        // Перебираем каждый массив внутри allBookingArrays
        for (const bookingArray of allBookingArrays) {
            // Сравниваем первые три элемента текущего массива с currentBookArray
            if (
                currentBookArray[0] === bookingArray[0] &&
                currentBookArray[1] === bookingArray[1] &&
                currentBookArray[2] === bookingArray[2]
            ) {
                console.log("Привет");
                return; // Если есть совпадение, завершаем функцию
            }
        }
        // Если не найдено совпадений, не выводим "Привет"
        console.log("Совпадений не найдено");
    } catch (error) {
        console.error("Ошибка при получении массивов", error);
    }
}

async function compareDays(currentBookArray, getAllArraysFunction) {
    try {
        const allBookingArrays = await getAllArraysFunction();

        let foundMatch = false;
        let foundMatchArray = [];

        for (const bookingArray of allBookingArrays) {
            if (
                currentBookArray[0] === bookingArray[0] &&
                currentBookArray[1] === bookingArray[1]
            ) {
                foundMatch = true;
                const newNumber = bookingArray[2];
                if (!foundMatchArray.includes(newNumber)) {
                    foundMatchArray.push(newNumber);
                }
                const repeatTimes = bookingArray[3];
                for (let i = 1; i <= repeatTimes; i++) {
                    const nextNumber = newNumber + i;
                    if (!foundMatchArray.includes(nextNumber)) {
                        foundMatchArray.push(nextNumber);
                    }
                }
            }
        }
        if (!foundMatch) {
            // Если совпадений не найдено, возвращаем ["22:00"]
            return ["22:00"];
        }
        const timeFormattedArray = foundMatchArray.map((number) => `${number}:00`);
        return timeFormattedArray;
    } catch (error) {
        console.error("Ошибка при получении массивов", error);
    }
}

function calculateTimeDifference(time1, timesArray) {
    // Разделяем строку времени time1 на часы и минуты
    const [hours1, minutes1] = time1.split(":").map(Number);
    const totalMinutes1 = hours1 * 60 + minutes1;

    // Находим ближайшее старшее время
    let closestGreaterTime = timesArray
        .map((time) => {
            const [hours, minutes] = time.split(":").map(Number);
            return { time, totalMinutes: hours * 60 + minutes };
        })
        .filter((timeObj) => timeObj.totalMinutes > totalMinutes1)
        .sort((a, b) => a.totalMinutes - b.totalMinutes)[0];

    let minuteDifference;
    if (closestGreaterTime) {
        minuteDifference = Math.abs(closestGreaterTime.totalMinutes - totalMinutes1);
    } else {
        // Если старшего времени нет, считаем разницу до 22:00
        minuteDifference = Math.abs(totalMinutes1 - 22 * 60);
    }

    // Переводим разницу в часы и возвращаем как число
    const hourDifference = Math.floor(minuteDifference / 60);
    return hourDifference;
}

module.exports = {
    getNextThreeMonths,
    getDaysInMonth,
    getMonthNameByIndex,
    compareArrays,
    compareDays,
    calculateTimeDifference,
};

const User = require("./type.js");
async function addArrayInAllBookings(newArray) {
    const userId = "65769b4ec7ca6f5a97a0e136";

    try {
        if (!newArray.every((item) => typeof item === "number")) {
            console.error("Новый массив содержит нечисловые элементы");
            return;
        }
        // Найди пользователя по его _id.
        const user = await User.findOne({ _id: userId });

        if (!user) {
            console.error("Пользователь не найден");
            return;
        }

        // Добавь новый массив к существующему свойству AllBookings.
        user.AllBookings.push(newArray);

        // Сохрани обновленный объект пользователя.
        await user.save();

        console.log("Новый массив добавлен в AllBookings");
    } catch (err) {
        console.error("Ошибка при обновлении пользователя", err);
    }
}

async function getAllArraysFromAllBookings() {
    const userId = "65769b4ec7ca6f5a97a0e136";

    try {
        // Найди пользователя по его _id.
        const user = await User.findOne({ _id: userId });

        if (!user) {
            console.error("Пользователь не найден");
            return;
        }
        return user.AllBookings;
    } catch (err) {
        console.error("Ошибка при получении массивов из AllBookings", err);
    }
}

async function removeLastElementFromAllBookings() {
    const userId = "65769b4ec7ca6f5a97a0e136"; // Постоянный идентификатор пользователя

    try {
        // Обновляем документ, удаляя последний элемент из массива AllBookings
        const result = await User.updateOne(
            { _id: userId },
            { $pop: { AllBookings: 1 } } // 1 для удаления последнего элемента
        );

        if (result.matchedCount === 0) {
            console.error("Пользователь не найден");
            return;
        }

        console.log("Последний элемент из AllBookings был удален");
        return result;
    } catch (err) {
        console.error("Ошибка при удалении последнего элемента из AllBookings", err);
    }
}

// newUser.AllBookings.push([...bookingsArray]);

// newUser
//     .save()
//     .then(() => {
//         console.log("Новый пользователь сохранен");
//     })
//     .catch((err) => {
//         console.error("Ошибка при сохранении пользователя", err);
//     });

module.exports = {
    addArrayInAllBookings,
    getAllArraysFromAllBookings,
    removeLastElementFromAllBookings,
};

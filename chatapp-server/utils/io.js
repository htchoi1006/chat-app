const chatController = require("../Controllers/chat.controller");
const userController = require("../Controllers/user.controller");

module.exports = function(io) {
    io.on("connection", async(socket) => {
        console.log("client connected", socket.id);

        socket.on("login", async(userName, cb) => {
            // 유저 정보를 저장
            try{
                const user = await userController.saveUser(userName, socket.id); 
                const welcomeMessage = {
                    chat: `${user.name} 님이 채팅방에 들어왔습니다.`,
                    user: { id: null, name: "system" },
                };
                io.emit("message", welcomeMessage);
                cb({ ok: true, data: user });
            }catch(error){
                cb({ ok: false, error: error.message });
            }
            
        });

        socket.on("sendMessage", async(message, cb) => {
            try {
                // 유저 찾기 (socket id로)
                const user = await userController.checkUser(socket.id);
                // 메시지 저장, 유저 정보 전달
                const newMessage = await chatController.saveChat(message, user);
                io.emit("message", newMessage);
                cb({ ok: true });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log("user disconnected")
        });
    });
};
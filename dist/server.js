"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = require("./app");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongo_1 = __importDefault(require("./database/mongo"));
require("./initConfig");
require("./utils/cronJobs");
// Declarar `io` en un alcance más amplio
let io;
const startApp = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = app_1.App.getInstance();
    // Crear servidor HTTP y Socket.IO
    const server = (0, http_1.createServer)(app);
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Permitir conexiones desde cualquier origen
        },
    });
    const port = process.env.PORT || 3004;
    (0, mongo_1.default)().then(() => console.log("Conectado a la BD"));
    // Cuando un usuario se conecta, se une a la sala 'home'
    io.on("connection", (socket) => {
        console.log("Nuevo usuario conectado", socket.id);
        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`Usuario ${socket.id} se unió a la sala ${room}`);
            socket.emit("joinedRoom", `Te has unido a la sala ${room}`);
        });
        // Cuando un usuario se desconecta
        socket.on("disconnect", () => {
            console.log("Usuario desconectado", socket.id);
        });
    });
    // Iniciar el servidor Express
    server.listen(port, () => {
        console.log(`Server running in port ${port}`);
    });
    return io;
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    yield startApp();
});
init();
//# sourceMappingURL=server.js.map
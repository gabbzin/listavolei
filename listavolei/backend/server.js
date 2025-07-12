import express from "express";
import pkg from "@prisma/client";
import cors from "cors";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const app = express();
app.use(cors({
    origin: "https://gabbzin.github.io/listavolei/"
}));
app.use(express.json()); // Garante que o corpo da requisição seja interpretado como JSON

app.post("/users", async (req, res) => {
    const { name, position } = req.body;

    if (!name?.trim() || !position?.trim()) {
        return res
            .status(400)
            .json({ error: "Nome e posição são obrigatórios" });
    }

    const user = await prisma.user.create({
        data: { name: name.trim(), position: position.trim() },
    });

    res.status(201).json(user);
});

app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();

    res.status(200).json(users);
});

// app.put("/users/:id", async (req, res) => {
//     const { id } = req.params;

//     try {
//         const updatedUser = await prisma.user.update({
//             where: { id: Number(id) },
//             data: {
//                 name: req.body.name,
//                 position: req.body.position,
//             },
//         });

//         res.status(200).json(updatedUser);
//     } catch (error) {
//         res.status(404).json({ error: "Usuário não encontrado" });
//     }
// });

// app.delete("/users", async (req, res) => {
//     await prisma.user.deleteMany();
//     res.status(204).send();
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

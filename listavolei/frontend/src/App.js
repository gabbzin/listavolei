import { useEffect, useState, useMemo } from "react";
import "./App.css"; // Importar a nova folha de estilos

const POSICOES = [
    "Levantador",
    "Ponteiro de Entrada",
    "Ponteiro de Saída",
    "Líbero"
];

export default function App() {
    const API_BASE = process.env.REACT_APP_API_URL || `https://listavolei-production.up.railway.app`;
    const [jogadores, setJogadores] = useState([]);
    const [nome, setNome] = useState("");
    const [posicao, setPosicao] = useState(POSICOES[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Efeito para buscar os jogadores iniciais da API
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/users`)
            .then((res) => {
                if (!res.ok) throw new Error("Falha ao buscar dados.");
                return res.json();
            })
            .then(setJogadores)
            .catch((err) => {
                console.error(err);
                setError("Não foi possível carregar os jogadores. Tente novamente mais tarde.");
                setJogadores([]);
            })
            .finally(() => setLoading(false));
    }, [API_BASE]);

    const adicionarJogador = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !posicao) return;

    // 1. Cria um jogador local com um ID temporário para a UI otimista
    const jogadorTemporario = { id: `temp-${Date.now()}`, name: nome.trim(), position: posicao };

    // 2. Atualiza a UI imediatamente
    setJogadores((jogadoresAtuais) => [...jogadoresAtuais, jogadorTemporario]);
    setNome("");
    setPosicao(POSICOES[0]);

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: jogadorTemporario.name, position: jogadorTemporario.position }),
        });

        if (!response.ok) throw new Error("Falha ao salvar o jogador no servidor.");

        // 3. Recebe o jogador salvo com o ID real do banco
        const jogadorSalvoDoBanco = await response.json();

        // 4. Atualiza o estado do React, substituindo o jogador temporário pelo jogador com o ID final
        setJogadores((jogadoresAtuais) =>
            jogadoresAtuais.map((j) =>
                j.id === jogadorTemporario.id ? jogadorSalvoDoBanco : j
            )
        );

    } catch (err) {
        console.error("Erro:", err);
        alert("Não foi possível adicionar o jogador. Verifique o console para mais detalhes.");
        // Em caso de erro, remove o jogador temporário que foi adicionado
        setJogadores((jogadoresAtuais) => jogadoresAtuais.filter((j) => j.id !== jogadorTemporario.id));
    }
};

    // Agrupa os jogadores por posição de forma otimizada com useMemo
    const jogadoresPorPosicao = useMemo(() => {
        const grupo = {};
        POSICOES.forEach(p => (grupo[p] = [])); // Inicializa todas as posições
        jogadores.forEach(j => {
            if (grupo[j.position]) {
                grupo[j.position].push(j);
            }
        });
        return grupo;
    }, [jogadores]);

    return (
        <div className="container">
            <h1>🏐 Campeonato de Vôlei 🏐</h1>

            <form onSubmit={adicionarJogador} className="form">
                <input
                    type="text"
                    placeholder="Nome do Jogador"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />
                <select value={posicao} onChange={(e) => setPosicao(e.target.value)} required>
                    {POSICOES.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
                <button type="submit">Adicionar Jogador</button>
            </form>

            {loading && <p className="loading-message">Carregando jogadores...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <div className="tables">
                    {POSICOES.map((pos) => (
                        <div key={pos} className="table-wrapper">
                            <h2>{pos}</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jogadoresPorPosicao[pos].map((j) => (
                                        <tr key={j.id}> {/* Usa o ID do jogador como chave */}
                                            <td>{j.name}</td>
                                        </tr>
                                    ))}
                                    {jogadoresPorPosicao[pos].length === 0 && (
                                        <tr>
                                            <td className="empty">Nenhum jogador nesta posição</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
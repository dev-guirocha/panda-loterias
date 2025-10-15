// /src/controllers/drawController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Rota: GET /api/draws/results
 * Busca os resultados de sorteios publicados.
 * Permite filtrar por data (opcional).
 */
exports.getPublishedResults = async (req, res) => {
  try {
    // --- Lógica de Filtro (Opcional, mas útil) ---
    // O front-end pode enviar: /api/draws/results?date=2025-10-14
    const { date } = req.query;

    let whereClause = {
      status: 'PUBLISHED', // Sempre buscamos apenas resultados publicados
    };

    if (date) {
      // Se uma data for fornecida, filtramos por ela
      const startDate = new Date(`${date}T00:00:00.000-03:00`); // Ex: Meia-noite no Brasil
      const endDate = new Date(`${date}T23:59:59.999-03:00`);   // Ex: Fim do dia no Brasil
      
      // (Ajuste o fuso horário -03:00 conforme o seu servidor, se necessário)
      
      whereClause.draw_date = {
        gte: startDate, // Greater than or equal (Maior ou igual)
        lte: endDate,   // Less than or equal (Menor ou igual)
      };
    } else {
      // Se NENHUMA data for fornecida, mostramos os resultados de HOJE
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Meia-noite de hoje
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Meia-noite de amanhã

      whereClause.draw_date = {
        gte: today,
        lt: tomorrow, // Less than (Menor que amanhã)
      };
    }

    // --- Fim da Lógica de Filtro ---

    const results = await prisma.drawResult.findMany({
      where: whereClause,
      orderBy: [
        { draw_date: 'desc' },
        { draw_schedule: { draw_time: 'asc' } } // Ordena por data, e depois pelo horário
      ],
      include: {
        draw_schedule: {
          select: { name: true, draw_time: true }, // "PTM", "11:20:00"
        },
      },
    });

    // Formatar a resposta
    const formattedResults = results.map(r => ({
      draw_id: r.id,
      schedule_name: r.draw_schedule.name,
      draw_time: r.draw_schedule.draw_time,
      draw_date: r.draw_date,
      status: r.status,
      results: {
        prize1: r.prize1_number,
        prize2: r.prize2_number,
        prize3: r.prize3_number,
        prize4: r.prize4_number,
        prize5: r.prize5_number,
        prize6: r.prize6_number,
        prize7: r.prize7_number,
      }
    }));

    res.json(formattedResults);

  } catch (error)
 {
    console.error('Erro ao buscar resultados publicados:', error);
    res.status(500).json({ error: 'Erro interno ao buscar resultados.' });
  }
};
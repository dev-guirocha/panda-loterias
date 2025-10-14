// /src/controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.publishResult = async (req, res) => {
  // 1. O ID do sorteio virá da URL (ex: /api/admin/results/1)
  const { id } = req.params;

  // 2. Os números vencedores virão do Body (JSON)
  const {
    prize1_number,
    prize2_number,
    prize3_number,
    prize4_number,
    prize5_number,
    prize6_number, // Opcional
    prize7_number, // Opcional
  } = req.body;

  // 3. Validação
  if (!prize1_number || !prize2_number || !prize3_number || !prize4_number || !prize5_number) {
    return res.status(400).json({ error: 'Os 5 primeiros prêmios são obrigatórios.' });
  }

  try {
    // 4. Verificar se o sorteio existe
    const drawResult = await prisma.drawResult.findUnique({
      where: { id: parseInt(id) },
    });

    if (!drawResult) {
      return res.status(404).json({ error: 'Sorteio (DrawResult) não encontrado.' });
    }

    if (drawResult.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Este sorteio já foi publicado.' });
    }

    // 5. Atualizar o sorteio no banco
    const updatedDrawResult = await prisma.drawResult.update({
      where: { id: parseInt(id) },
      data: {
        prize1_number,
        prize2_number,
        prize3_number,
        prize4_number,
        prize5_number,
        prize6_number: prize6_number || null, // Se for nulo, salva null
        prize7_number: prize7_number || null, // Se for nulo, salva null
        status: 'PUBLISHED', // Mudamos o status!
      },
    });

    res.json({ message: 'Resultado publicado com sucesso!', result: updatedDrawResult });

  } catch (error) {
    console.error('Erro ao publicar resultado:', error);
    res.status(500).json({ error: 'Erro interno ao publicar resultado.' });
  }
};
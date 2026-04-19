import React from 'react';
import videoImposto from '../assets/Imposto_de_Renda__PF_ou_PJ_.mp4';

// Formata números como moeda em reais.
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// Estilos principais do container de resultados.
const containerStyle = { /* ... */ };
const tituloStyle = { /* ... */ };
const cardContainerStyle = { display: 'flex', justifyContent: 'space-around', gap: '20px', marginTop: '30px' };
const cardBaseStyle = { /* ... */ };
const destaqueStyle = (isMelhor) => ({
    padding: '18px',
    borderRadius: '8px',
    backgroundColor: isMelhor ? '#072033' : '#0b2236',
    border: isMelhor ? '3px solid #ffeb3b' : '1px solid zilver',
    minWidth: '300px',
    flex: 1,
});


const ResultadoComparacao = ({ dadosEntrada, resultadoPF, resultadoPJ }) => {
    // URLs dos vídeos para cada combinação de profissão e melhor opção (vídeo provisório único).
    const videoUrls = {
        psicologo: {
            PF: videoImposto,
            PJ: videoImposto
        },
        advogado: {
            PF: videoImposto,
            PJ: videoImposto
        },
        arquiteto: {
            PF: videoImposto,
            PJ: videoImposto
        }
    };

    if (!dadosEntrada || !resultadoPF || !resultadoPJ) {
        return (
            <div id="resultado-comparacao" style={containerStyle}>
                <h2 style={tituloStyle}>Resultado da Simulação e Comparação</h2>
                <p style={{ textAlign: 'center', color: '#ffeb3b' }}>
                    Aguardando cálculo. Por favor, preencha o formulário e clique em "Calcular".
                </p>
            </div>
        );
    }

    // Extrai a renda líquida dos resultados de PF e PJ.
    const rendaPFLiquida = resultadoPF.rendaLiquida;
    const rendaPJLiquida = resultadoPJ.rendaLiquida;

    // Compara para determinar qual opção tem maior renda líquida.
    const isPFMelhor = rendaPFLiquida >= rendaPJLiquida;

    // Determina a profissão e a melhor opção para escolher o vídeo.
    const profissao = dadosEntrada.profissao;
    const melhorOpcao = isPFMelhor ? 'PF' : 'PJ';
    const videoUrl = videoUrls[profissao]?.[melhorOpcao] || videoImposto;
    
    const CardPF = (
        <div style={destaqueStyle(isPFMelhor)}>
            <h4 style={{ color: isPFMelhor ? '#00ccff' : 'white', borderBottom: '1px solid #1e3c72', paddingBottom: '10px' }}>
                Pessoa Física (PF)
            </h4>
            
            <p><strong>Renda Mensal:</strong> {formatter.format(dadosEntrada.rendaMensal)}</p>
            <p><strong>Custos Mensais:</strong> {formatter.format(dadosEntrada.custosMensais)}</p>
            
            <p><strong>Base de Cálculo (IRPF):</strong> {formatter.format(resultadoPF.basePF)}</p>
            <p><strong>IRPF a Pagar:</strong> <strong style={{ color: '#ffeb3b' }}>{formatter.format(resultadoPF.imposto)}</strong></p>
            
            <hr style={{ borderColor: '#1e3c72', margin: '15px 0' }}/>
            <h3 style={{ color: '#00ccff' }}>
                Renda Líquida (Simplificada): {formatter.format(rendaPFLiquida)}
            </h3>
            {isPFMelhor && <p style={{ color: '#ffeb3b', fontWeight: 'bold' }}>&#9733; MELHOR OPÇÃO</p>}
        </div>
    );

    const CardPJ = (
        <div style={destaqueStyle(!isPFMelhor)}>
            <h4 style={{ color: !isPFMelhor ? '#00ccff' : 'white', borderBottom: '1px solid #1e3c72', paddingBottom: '10px' }}>
                Pessoa Jurídica (PJ - Simples Nacional)
            </h4>
            
            <p><strong>Renda Mensal:</strong> {formatter.format(dadosEntrada.rendaMensal)}</p>
            {dadosEntrada.profissao === 'advogado' ? (
                <>
                    <p><strong>Simples Nacional (4.5%):</strong> {formatter.format(resultadoPJ.simples_nac)}</p>
                    <p><strong>Pró-Labore (fixo):</strong> {formatter.format(resultadoPJ.pro_labore)}</p>
                    <p><strong>INSS (11%):</strong> {formatter.format(resultadoPJ.inss)}</p>
                    <p><strong>INSS Patronal (20%):</strong> {formatter.format(resultadoPJ.inss_patronal)}</p>
                </>
            ) : (
                <>
                    <p><strong>28% da Renda (Pró-Labore):</strong> {formatter.format(resultadoPJ.pro_labore)}</p>
                    <p><strong>Simples Nacional (6%):</strong> {formatter.format(resultadoPJ.simples_nac)}</p>
                    <p><strong>INSS (11%):</strong> {formatter.format(resultadoPJ.inss)}</p>
                </>
            )}
            <p><strong>Imposto Total a Pagar:</strong> <strong style={{ color: '#ffeb3b' }}>{formatter.format(resultadoPJ.imposto)}</strong></p>
            
            <hr style={{ borderColor: '#1e3c72', margin: '15px 0' }}/>
            <h3 style={{ color: '#00ccff' }}>
                Renda Líquida (Simplificada): {formatter.format(rendaPJLiquida)}
            </h3>
            {!isPFMelhor && <p style={{ color: '#ffeb3b', fontWeight: 'bold' }}>&#9733; MELHOR OPÇÃO</p>}
        </div>
    );


    return (
        <div id="resultado-comparacao" style={containerStyle}>
            <h2 style={tituloStyle}>Resultado da Simulação e Comparação</h2>
            
            <p style={{ textAlign: 'center', marginBottom: '30px', color: '#ccc' }}>
                Renda Bruta Mensal de Entrada: <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>{formatter.format(dadosEntrada.rendaMensal)}</span>
            </p>

            <div style={cardContainerStyle}>
                {CardPF}
                {CardPJ}
            </div>

            {/* Vídeo relacionado à melhor opção conforme a profissão selecionada (vídeo provisório). */}
            {videoUrl && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h3 style={{ color: '#ffeb3b', marginBottom: '20px' }}>
                        Vídeo Explicativo: {melhorOpcao} para {profissao.charAt(0).toUpperCase() + profissao.slice(1)}
                    </h3>
                    <video
                        width="560"
                        height="315"
                        controls
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                    >
                        <source src={videoUrl} type="video/mp4" />
                        Seu navegador não suporta o elemento de vídeo.
                    </video>
                </div>
            )}

        </div>
    );
};

export default ResultadoComparacao;
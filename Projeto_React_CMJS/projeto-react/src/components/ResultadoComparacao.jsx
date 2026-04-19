/**
 * ResultadoComparacao
 * ---------------------------------------------------------
 * Componente principal de Apresentação (View).
 * Recebe os cálculos prontos (via Props) do App.jsx e renderiza
 * comparativamente os cards de Pessoa Física e Jurídica em tela.
 * Inclui também o motor de injeção da geração de PDF (react-pdf).
 */
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeradorPDF from './GeradorPDF.jsx';
// Asset multimídia de fundo
import videoImposto from '../assets/Imposto_de_Renda__PF_ou_PJ_.mp4';

// Utilitário global para padronização monetária (BRL)
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/* Estilos Globais da Tela de Comparação */
const containerStyle = { /* ... */ };
const tituloStyle = { /* ... */ };
const cardContainerStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '20px', marginTop: '30px' };
const cardBaseStyle = { /* ... */ };

// Retorna declaração CSS-in-JS dinâmica para o card predominante 
const destaqueStyle = (isMelhor) => ({
    padding: '18px',
    borderRadius: '8px',
    backgroundColor: isMelhor ? '#072033' : '#0b2236',
    border: isMelhor ? '3px solid #ffeb3b' : '1px solid zilver',
    minWidth: '300px',
    flex: 1,
});

const ResultadoComparacao = ({ dadosEntrada, resultadoPF, resultadoPJ }) => {

    // Dicionário de associações em mídia para suporte dinâmico no renderizador
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

    // Fallback de contingência para evitar re-render de estado nulo antes da submissão primária
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

    // Extração das métricas finais de liquidez
    const rendaPFLiquida = resultadoPF.rendaLiquida;
    const rendaPJLiquida = resultadoPJ.rendaLiquida;

    // Avaliação do melhor enquadramento fiscal
    const isPFMelhor = rendaPFLiquida >= rendaPJLiquida;

    // Resolução encadeada do asset multimídia
    const profissao = dadosEntrada.profissao;
    const melhorOpcao = isPFMelhor ? 'PF' : 'PJ';
    const videoUrl = videoUrls[profissao]?.[melhorOpcao] || videoImposto; // Prevenção contra falha de injeção e fallback seguro


    /* ----------------------------------------------------
       MONTANDO A UI DO CARD DA PESSOA FÍSICA
    ------------------------------------------------------ */
    const CardPF = (
        <div style={destaqueStyle(isPFMelhor)} className={`card-comparacao animate-fade-in-up animate-delay-1 ${isPFMelhor ? 'animate-winner' : ''}`}>
            {/* Renderização dinâmica do header */}
            <h4 style={{ color: isPFMelhor ? '#00ccff' : 'white', borderBottom: '1px solid #1e3c72', paddingBottom: '10px' }}>
                Pessoa Física (PF)
            </h4>

            <p><strong>Renda Mensal:</strong> {formatter.format(dadosEntrada.rendaMensal)}</p>
            <p><strong>Custos Mensais:</strong> {formatter.format(dadosEntrada.custosMensais)}</p>

            <p><strong>Base de Cálculo (IRPF):</strong> {formatter.format(resultadoPF.basePF)}</p>
            {/* Destaque visual do imposto calculado */}
            <p><strong>IRPF a Pagar:</strong> <strong style={{ color: '#ffeb3b' }}>{formatter.format(resultadoPF.imposto)}</strong></p>

            <hr style={{ borderColor: '#1e3c72', margin: '15px 0' }} />

            <h3 style={{ color: '#00ccff' }}>
                Renda Líquida (Simplificada): {formatter.format(rendaPFLiquida)}
            </h3>

            {/* Indicador visual de benefício financeiro */}
            {isPFMelhor && <p style={{ color: '#ffeb3b', fontWeight: 'bold' }}>&#9733; MELHOR OPÇÃO</p>}
        </div>
    );


    /* ----------------------------------------------------
       MONTANDO A UI DO CARD DA PESSOA JURÍDICA
    ------------------------------------------------------ */
    const CardPJ = (
        <div style={destaqueStyle(!isPFMelhor)} className={`card-comparacao animate-fade-in-up animate-delay-2 ${!isPFMelhor ? 'animate-winner' : ''}`}>
            <h4 style={{ color: !isPFMelhor ? '#00ccff' : 'white', borderBottom: '1px solid #1e3c72', paddingBottom: '10px' }}>
                Pessoa Jurídica (PJ - Simples Nacional)
            </h4>

            <p><strong>Renda Mensal:</strong> {formatter.format(dadosEntrada.rendaMensal)}</p>

            {/* Tratamento específico para a classe de Advocacia Anexo IV */}
            {dadosEntrada.profissao === 'advogado' ? (
                <>
                    <p><strong>Simples Nacional (4.5%):</strong> {formatter.format(resultadoPJ.simples_nac)}</p>
                    <p><strong>Pró-Labore (fixo):</strong> {formatter.format(resultadoPJ.pro_labore)}</p>
                    <p><strong>INSS (11%):</strong> {formatter.format(resultadoPJ.inss)}</p>
                    <p><strong>INSS Patronal (20%):</strong> {formatter.format(resultadoPJ.inss_patronal)}</p>
                </>
            ) : (
                <>
                    {/* Tratamento padrão para outras profissões (Fator R) */}
                    <p><strong>28% da Renda (Pró-Labore):</strong> {formatter.format(resultadoPJ.pro_labore)}</p>
                    <p><strong>Simples Nacional (6%):</strong> {formatter.format(resultadoPJ.simples_nac)}</p>
                    <p><strong>INSS (11%):</strong> {formatter.format(resultadoPJ.inss)}</p>
                </>
            )}

            <p><strong>Imposto Total a Pagar:</strong> <strong style={{ color: '#ffeb3b' }}>{formatter.format(resultadoPJ.imposto)}</strong></p>

            <hr style={{ borderColor: '#1e3c72', margin: '15px 0' }} />
            <h3 style={{ color: '#00ccff' }}>
                Renda Líquida (Simplificada): {formatter.format(rendaPJLiquida)}
            </h3>

            {/* Selo se ganhou */}
            {!isPFMelhor && <p style={{ color: '#ffeb3b', fontWeight: 'bold' }}>&#9733; MELHOR OPÇÃO</p>}
        </div>
    );


    return (
        <div id="resultado-comparacao" style={containerStyle} className="animate-fade-in-up">
            <h2 style={tituloStyle}>Resultado da Simulação e Comparação</h2>

            <p style={{ textAlign: 'center', marginBottom: '30px', color: '#ccc' }}>
                Renda Bruta Mensal de Entrada: <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>{formatter.format(dadosEntrada.rendaMensal)}</span>
            </p>

            {/* Injetando as caixas HTML da Pessoa Fisica e Juridica que montamos ali em cima */}
            <div style={cardContainerStyle}>
                {CardPF}
                {CardPJ}
            </div>

            {/* Alinhando todo aquele grande botão maravilhoso animado do PDF */}
            <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'center' }} className="animate-fade-in-up animate-delay-2">
                <PDFDownloadLink
                    document={<GeradorPDF dadosEntrada={dadosEntrada} resultadoPF={resultadoPF} resultadoPJ={resultadoPJ} />}
                    fileName={`Comparativo_Tributario_${dadosEntrada.profissao}.pdf`}
                    style={{ textDecoration: 'none' }}
                >
                    {({ loading }) => (
                        <button className="btn-primary" style={{ width: 'auto', padding: '15px 40px', display: 'inline-block', minWidth: '300px' }} disabled={loading}>
                            {loading ? '⏳ Montando Documento Dinâmico...' : '📄 Baixar Comparativo em PDF'}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>

            {/* Renderiza o tocador de vídeo só se tiver retornado uma URL válida com o resultado do imposto */}
            {videoUrl && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h3 style={{ color: '#ffeb3b', marginBottom: '20px' }}>
                        Vídeo Explicativo: {melhorOpcao} para {profissao.charAt(0).toUpperCase() + profissao.slice(1)} {/* charAt pra dexar o "A"dvogado ou "M"edico com letra maiúscula */}
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
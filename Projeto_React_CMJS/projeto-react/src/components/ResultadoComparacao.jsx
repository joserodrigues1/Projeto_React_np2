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
// Importando o vídeozinho maroto embutido pra ficar tocando em loop no final da simulação
import videoImposto from '../assets/Imposto_de_Renda__PF_ou_PJ_.mp4';

// Instanciando logo o Intl pra formatar nossa bufunfa pra padrão R$ Brazuca certinho com ,00 
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

// Helpezinho de CSS pra pintar o Card vencedor com uma bordinha dourada/amarela e fundinho azul mais escuro, dando aquele Tchan
const destaqueStyle = (isMelhor) => ({
    padding: '18px',
    borderRadius: '8px',
    backgroundColor: isMelhor ? '#072033' : '#0b2236',
    border: isMelhor ? '3px solid #ffeb3b' : '1px solid zilver',
    minWidth: '300px',
    flex: 1,
});

const ResultadoComparacao = ({ dadosEntrada, resultadoPF, resultadoPJ }) => {

    // Um mini-dicinário pra gente plugar os vídeos certos baseados na profissão e se valeu a pena meter uma PF ou PJ.
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

    // Segurança anti-crash: se tiver renderizando vazio antes do usuário clicar no "Calcular" esconde o componente main e mostra uma call-to-action
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

    // Pega a grana q sobrou no bolso no fim do rolê
    const rendaPFLiquida = resultadoPF.rendaLiquida;
    const rendaPJLiquida = resultadoPJ.rendaLiquida;

    // Lógica boba quem sobrar com mais no fim é o "isMelhor = TRUE" 
    const isPFMelhor = rendaPFLiquida >= rendaPJLiquida;

    // Configurando as views pro render do video abaixo
    const profissao = dadosEntrada.profissao;
    const melhorOpcao = isPFMelhor ? 'PF' : 'PJ';
    const videoUrl = videoUrls[profissao]?.[melhorOpcao] || videoImposto; // Fallback garantido se n achar o link


    /* ----------------------------------------------------
       MONTANDO A UI DO CARD DA PESSOA FÍSICA
    ------------------------------------------------------ */
    const CardPF = (
        <div style={destaqueStyle(isPFMelhor)} className={`card-comparacao animate-fade-in-up animate-delay-1 ${isPFMelhor ? 'animate-winner' : ''}`}>
            {/* Header condicional aceso ou apagado */}
            <h4 style={{ color: isPFMelhor ? '#00ccff' : 'white', borderBottom: '1px solid #1e3c72', paddingBottom: '10px' }}>
                Pessoa Física (PF)
            </h4>

            <p><strong>Renda Mensal:</strong> {formatter.format(dadosEntrada.rendaMensal)}</p>
            <p><strong>Custos Mensais:</strong> {formatter.format(dadosEntrada.custosMensais)}</p>

            <p><strong>Base de Cálculo (IRPF):</strong> {formatter.format(resultadoPF.basePF)}</p>
            {/* Dói no rim ter que pagar isso tudo... amarelinho pra alertar */}
            <p><strong>IRPF a Pagar:</strong> <strong style={{ color: '#ffeb3b' }}>{formatter.format(resultadoPF.imposto)}</strong></p>

            <hr style={{ borderColor: '#1e3c72', margin: '15px 0' }} />

            <h3 style={{ color: '#00ccff' }}>
                Renda Líquida (Simplificada): {formatter.format(rendaPFLiquida)}
            </h3>

            {/* Selo amarelho de VENCEDOR aqui... e que vença o q sobrar mais kkkk */}
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

            {/* Condicional pro render chato do Advogado onde o ProLabore é flat rate 1,6K e tem aquela cota patronal horrivel */}
            {dadosEntrada.profissao === 'advogado' ? (
                <>
                    <p><strong>Simples Nacional (4.5%):</strong> {formatter.format(resultadoPJ.simples_nac)}</p>
                    <p><strong>Pró-Labore (fixo):</strong> {formatter.format(resultadoPJ.pro_labore)}</p>
                    <p><strong>INSS (11%):</strong> {formatter.format(resultadoPJ.inss)}</p>
                    <p><strong>INSS Patronal (20%):</strong> {formatter.format(resultadoPJ.inss_patronal)}</p>
                </>
            ) : (
                <>
                    {/* Render basicão pro resto dos mortais */}
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
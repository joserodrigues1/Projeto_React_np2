import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import LogoUnichristusPDF from '../assets/logoUnichristus_convert.png';

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Estilo CSS-in-JS para os vetores do PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#05142E',
    borderBottomWidth: 5,
    borderBottomColor: '#007284',
    padding: 20,
    marginBottom: 20
  },
  logo: {
    width: 150,
    height: 'auto'
  },
  headerTextContainer: {
    textAlign: 'right',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#9EABC0',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#0a1e35',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    gap: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007284'
  },
  summaryText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold'
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#0b2236',
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  cardWinner: {
    flex: 1,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#072033',
    borderWidth: 3,
    borderColor: '#ffeb3b',
  },
  cardTitle: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a3350',
    paddingBottom: 15,
    marginBottom: 15,
    fontWeight: 'bold'
  },
  cardTitleWinner: {
    fontSize: 14,
    color: '#00a8cc',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a3350',
    paddingBottom: 15,
    marginBottom: 15,
    fontWeight: 'bold'
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  label: {
    fontSize: 10,
    color: '#a0aab8'
  },
  value: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold'
  },
  valueHighlight: {
    fontSize: 10,
    color: '#ffeb3b',
    fontWeight: 'bold'
  },
  dividerDotted: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: '#1e3c72',
    marginVertical: 15
  },
  liquidIncomeContainer: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15
  },
  liquidIncome: {
    fontSize: 14,
    color: '#00ccff',
    fontWeight: 'bold',
  },
  winnerBadge: {
    color: '#ffeb3b',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#a0aab8',
    fontSize: 8,
  }
});

const GeradorPDF = ({ dadosEntrada, resultadoPF, resultadoPJ }) => {

  const rendaPFLiquida = resultadoPF.rendaLiquida;
  const rendaPJLiquida = resultadoPJ.rendaLiquida;
  const isPFMelhor = rendaPFLiquida >= rendaPJLiquida;

  const renderCardPF = () => (
    <View style={isPFMelhor ? styles.cardWinner : styles.card}>
      <Text style={isPFMelhor ? styles.cardTitleWinner : styles.cardTitle}>Pessoa Física (PF)</Text>

      <View style={styles.rowItem}>
        <Text style={styles.label}>Receita Mensal</Text>
        <Text style={styles.value}>{formatter.format(dadosEntrada.rendaMensal)}</Text>
      </View>
      <View style={styles.rowItem}>
        <Text style={styles.label}>Despesas (Custos)</Text>
        <Text style={styles.value}>{formatter.format(dadosEntrada.custosMensais)}</Text>
      </View>
      <View style={styles.rowItem}>
        <Text style={styles.label}>Base de Cálculo (IRPF)</Text>
        <Text style={styles.value}>{formatter.format(resultadoPF.basePF)}</Text>
      </View>
      <View style={styles.rowItem}>
        <Text style={styles.label}>IRPF a Pagar</Text>
        <Text style={styles.valueHighlight}>{formatter.format(resultadoPF.imposto)}</Text>
      </View>

      <View style={styles.dividerDotted}></View>

      <View style={styles.liquidIncomeContainer}>
        <Text style={styles.liquidIncome}>Sobra Líquida: {formatter.format(rendaPFLiquida)}</Text>
      </View>

      {isPFMelhor && <Text style={styles.winnerBadge}>★ MELHOR OPÇÃO</Text>}
    </View>
  );

  const renderCardPJ = () => (
    <View style={!isPFMelhor ? styles.cardWinner : styles.card}>
      <Text style={!isPFMelhor ? styles.cardTitleWinner : styles.cardTitle}>Pessoa Jurídica (PJ - Simples Nacional)</Text>

      <View style={styles.rowItem}>
        <Text style={styles.label}>Receita Mensal</Text>
        <Text style={styles.value}>{formatter.format(dadosEntrada.rendaMensal)}</Text>
      </View>

      <View style={styles.rowItem}>
        <Text style={styles.label}>Pró-Labore</Text>
        <Text style={styles.value}>{formatter.format(resultadoPJ.pro_labore)}</Text>
      </View>
      <View style={styles.rowItem}>
        <Text style={styles.label}>Simples Nacional</Text>
        <Text style={styles.value}>{formatter.format(resultadoPJ.simples_nac)}</Text>
      </View>

      {dadosEntrada.profissao === 'advogado' ? (
        <>
          <View style={styles.rowItem}>
            <Text style={styles.label}>INSS Mensal</Text>
            <Text style={styles.value}>{formatter.format(resultadoPJ.inss)}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>INSS Patronal</Text>
            <Text style={styles.value}>{formatter.format(resultadoPJ.inss_patronal)}</Text>
          </View>
        </>
      ) : (
        <View style={styles.rowItem}>
          <Text style={styles.label}>INSS Mensal</Text>
          <Text style={styles.value}>{formatter.format(resultadoPJ.inss)}</Text>
        </View>
      )}

      <View style={styles.rowItem}>
        <Text style={styles.label}>Total de Impostos</Text>
        <Text style={styles.valueHighlight}>{formatter.format(resultadoPJ.imposto)}</Text>
      </View>

      <View style={styles.dividerDotted}></View>

      <View style={styles.liquidIncomeContainer}>
        <Text style={styles.liquidIncome}>Sobra Líquida: {formatter.format(rendaPJLiquida)}</Text>
      </View>

      {!isPFMelhor && <Text style={styles.winnerBadge}>★ MELHOR OPÇÃO</Text>}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho do documento */}
        <View style={styles.header}>
          <Image style={styles.logo} src={LogoUnichristusPDF} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Calculadora de Tributação</Text>
            <Text style={styles.headerSubtitle}>Pessoa Física e Jurídica</Text>
          </View>
        </View>

        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>Profissão: {dadosEntrada.profissao.charAt(0).toUpperCase() + dadosEntrada.profissao.slice(1)}</Text>
          <Text style={styles.summaryText}>Receita Mensal: {formatter.format(dadosEntrada.rendaMensal)}</Text>
          <Text style={styles.summaryText}>Custos: {formatter.format(dadosEntrada.custosMensais)}</Text>
        </View>

        <View style={styles.cardsContainer}>
          {renderCardPF()}
          {renderCardPJ()}
        </View>

        <Text style={styles.footer}>
          * Os valores apresentados são simulações matemáticas baseadas nas alíquotas do Simples Nacional vigentes em 2024.
        </Text>

      </Page>
    </Document>
  );
};

export default GeradorPDF;

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DecimalPipe, KeyValuePipe } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

type HistoricoItem = {
  texto: string;
  resultado: number;
  hora: string;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    DecimalPipe,
    KeyValuePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton
  ],
})
export class HomePage {
  valor = 1;
  moedaOrigem = 'USD';
  moedaDestino = 'BRL';
  resultado = 0;
  taxaAtual = 0;
  mensagemOffline = '';
  destinoViagem = '';
  buscaMoeda = '';

  frequenciaAtualizacao = 'sempre';
  receberNotificacoes = false;

  moedas = [
    'USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS',
    'MXN', 'KRW', 'SGD', 'THB', 'VND', 'INR', 'NZD', 'AED', 'QAR', 'SAR', 'ZAR'
  ];

  nomes: any = {
    USD: 'Dólar Americano',
    BRL: 'Real Brasileiro',
    EUR: 'Euro',
    GBP: 'Libra Esterlina',
    JPY: 'Iene Japonês',
    CAD: 'Dólar Canadense',
    AUD: 'Dólar Australiano',
    CHF: 'Franco Suíço',
    CNY: 'Yuan Chinês',
    ARS: 'Peso Argentino',
    MXN: 'Peso Mexicano',
    KRW: 'Won Sul-Coreano',
    SGD: 'Dólar de Singapura',
    THB: 'Baht Tailandês',
    VND: 'Dong Vietnamita',
    INR: 'Rúpia Indiana',
    NZD: 'Dólar Neozelandês',
    AED: 'Dirham dos Emirados',
    QAR: 'Rial Catariano',
    SAR: 'Rial Saudita',
    ZAR: 'Rand Sul-Africano'
  };

  bandeiras: any = {
    USD: 'https://flagcdn.com/us.svg',
    BRL: 'https://flagcdn.com/br.svg',
    EUR: 'https://flagcdn.com/eu.svg',
    GBP: 'https://flagcdn.com/gb.svg',
    JPY: 'https://flagcdn.com/jp.svg',
    CAD: 'https://flagcdn.com/ca.svg',
    AUD: 'https://flagcdn.com/au.svg',
    CHF: 'https://flagcdn.com/ch.svg',
    CNY: 'https://flagcdn.com/cn.svg',
    ARS: 'https://flagcdn.com/ar.svg',
    MXN: 'https://flagcdn.com/mx.svg',
    KRW: 'https://flagcdn.com/kr.svg',
    SGD: 'https://flagcdn.com/sg.svg',
    THB: 'https://flagcdn.com/th.svg',
    VND: 'https://flagcdn.com/vn.svg',
    INR: 'https://flagcdn.com/in.svg',
    NZD: 'https://flagcdn.com/nz.svg',
    AED: 'https://flagcdn.com/ae.svg',
    QAR: 'https://flagcdn.com/qa.svg',
    SAR: 'https://flagcdn.com/sa.svg',
    ZAR: 'https://flagcdn.com/za.svg'
  };

  destinos: any = {
    '🇧🇷 Brasil': 'BRL',
    '🇺🇸 Estados Unidos': 'USD',
    '🇨🇦 Canadá': 'CAD',
    '🇲🇽 México': 'MXN',
    '🇦🇷 Argentina': 'ARS',
    '🇬🇧 Reino Unido': 'GBP',
    '🇪🇺 França': 'EUR',
    '🇪🇺 Alemanha': 'EUR',
    '🇪🇺 Itália': 'EUR',
    '🇪🇺 Espanha': 'EUR',
    '🇪🇺 Portugal': 'EUR',
    '🇪🇺 Holanda': 'EUR',
    '🇨🇭 Suíça': 'CHF',
    '🇯🇵 Japão': 'JPY',
    '🇨🇳 China': 'CNY',
    '🇰🇷 Coreia do Sul': 'KRW',
    '🇸🇬 Singapura': 'SGD',
    '🇹🇭 Tailândia': 'THB',
    '🇮🇳 Índia': 'INR',
    '🇦🇺 Austrália': 'AUD',
    '🇳🇿 Nova Zelândia': 'NZD',
    '🇦🇪 Emirados Árabes Unidos': 'AED',
    '🇿🇦 África do Sul': 'ZAR'
  };

  historico: HistoricoItem[] = [];

  constructor(private http: HttpClient) {
    const dados = localStorage.getItem('historico');
    const configFrequencia = localStorage.getItem('frequenciaAtualizacao');
    const configNotificacoes = localStorage.getItem('receberNotificacoes');

    if (dados) {
      this.historico = JSON.parse(dados);
    }

    if (configFrequencia) {
      this.frequenciaAtualizacao = configFrequencia;
    }

    if (configNotificacoes) {
      this.receberNotificacoes = JSON.parse(configNotificacoes);
    }

    this.atualizarTaxaInicial();
  }

  moedasFiltradas() {
    const busca = this.buscaMoeda.toLowerCase();

    return this.moedas.filter(moeda =>
      moeda.toLowerCase().includes(busca) ||
      this.nomes[moeda].toLowerCase().includes(busca)
    );
  }

  atualizarTaxaInicial() {
    const url = `https://open.er-api.com/v6/latest/${this.moedaOrigem}`;

    this.http.get<any>(url).subscribe({
      next: (dados) => {
        const taxa = dados.rates[this.moedaDestino];

        this.taxaAtual = taxa;
        this.resultado = this.valor * taxa;

        localStorage.setItem('ultimaTaxa', JSON.stringify(taxa));
      },
      error: () => {
        const taxaSalva = localStorage.getItem('ultimaTaxa');

        if (taxaSalva) {
          const taxa = JSON.parse(taxaSalva);

          this.taxaAtual = taxa;
          this.resultado = this.valor * taxa;
          this.mensagemOffline = '⚠ Taxa inicial carregada com dados salvos localmente.';
        }
      }
    });
  }

  converter() {
    const url = `https://open.er-api.com/v6/latest/${this.moedaOrigem}`;

    if (!navigator.onLine) {
      const taxaSalva = localStorage.getItem('ultimaTaxa');

      if (taxaSalva) {
        const taxa = JSON.parse(taxaSalva);

        this.taxaAtual = taxa;
        this.resultado = this.valor * taxa;
        this.mensagemOffline = '⚠ Conversão realizada com a última taxa salva localmente.';

        this.salvarHistorico();
        return;
      }
    }

    this.http.get<any>(url).subscribe({
      next: (dados) => {
        const taxa = dados.rates[this.moedaDestino];

        this.taxaAtual = taxa;
        this.mensagemOffline = '';

        localStorage.setItem('ultimaTaxa', JSON.stringify(taxa));

        this.resultado = this.valor * taxa;
        this.salvarHistorico();
      },
      error: () => {
        const taxaSalva = localStorage.getItem('ultimaTaxa');

        if (taxaSalva) {
          const taxa = JSON.parse(taxaSalva);

          this.taxaAtual = taxa;
          this.resultado = this.valor * taxa;
          this.mensagemOffline = '⚠ Conversão realizada com a última taxa salva localmente.';

          this.salvarHistorico();
        }
      }
    });
  }

  selecionarDestino() {
    if (this.destinoViagem) {
      this.moedaDestino = this.destinos[this.destinoViagem];
      this.limparResultado();
    }
  }

  salvarHistorico() {
    const item: HistoricoItem = {
      texto: `${this.valor} ${this.moedaOrigem} = ${this.resultado.toFixed(2)} ${this.moedaDestino}`,
      resultado: this.resultado,
      hora: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    this.historico.unshift(item);
    localStorage.setItem('historico', JSON.stringify(this.historico));
  }

  inverterMoedas() {
    const temp = this.moedaOrigem;
    this.moedaOrigem = this.moedaDestino;
    this.moedaDestino = temp;
    this.limparResultado();
  }

  limparHistorico() {
    this.historico = [];
    localStorage.removeItem('historico');
  }

  limparResultado() {
    this.resultado = 0;
    this.taxaAtual = 0;
    this.mensagemOffline = '';
  }

  salvarConfiguracoes() {
    localStorage.setItem('frequenciaAtualizacao', this.frequenciaAtualizacao);
    localStorage.setItem('receberNotificacoes', JSON.stringify(this.receberNotificacoes));
  }
}
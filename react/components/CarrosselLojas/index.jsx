import React from 'react'

import styles from './carrossel-lojas.css'
import jardins from './lojas/jardins.png'
import tijuca from './lojas/tijuca.png'
import icarai from './lojas/icarai.png'
import ipanema from './lojas/ipanema.png'

const lojas = [
  {
    id: 1,
    nome: 'Jardins',
    local: 'São Paulo/SP',
    localizacao: '#maps',
    imagem: jardins,
  },
  {
    id: 2,
    nome: 'Barra da Tijuca',
    local: 'Rio de Janeiro/RJ',
    localizacao: '#maps',
    imagem: tijuca,
  },
  {
    id: 3,
    nome: 'Icaraí',
    local: 'Niterói/RJ',
    localizacao: '#maps',
    imagem: icarai,
  },
  {
    id: 4,
    nome: 'Ipanema',
    local: 'Rio de Janeiro/RJ',
    localizacao: '#maps',
    imagem: ipanema,
  },
]

const CarrosselLojas = () => {
  return (
    <div className={styles.lojasWrapper}>
      {lojas.map(loja => (
        <div key={loja.id} className={styles.cardLoja}>
          <div className={styles.lojaImagem}>
            <img src={loja.imagem} alt={loja.nome} />
          </div>
          <div className={styles.lojaInfos}>
            <div className={styles.lojaLocal}>
              <h3>{loja.nome}</h3>
              <p>{loja.local}</p>
            </div>
            <div className={styles.lojaLocalizacao}>
              <a href="/pagina">Localização</a>
            </div>
          </div>
          <div />
        </div>
      ))}
      <div className={styles.allLojas}>
        <a href="/pagina">Todas nossas lojas</a>
      </div>
    </div>
  )
}

export default CarrosselLojas

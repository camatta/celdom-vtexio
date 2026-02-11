import React from "react";

function LogoLoja({ src, alt = "Celdom", href = "/", width = "auto", height = "auto" }) {
    return (
        <h1 style={{"marginBlock":"0"}}>
            <a href={href} className="logoLink" aria-label={alt}>
                <img src={src} alt={alt} title={alt} loading="eager" fetchpriority="high" decoding="async" width={width} height={height} />
            </a>
        </h1>
    )
}

LogoLoja.schema = {
  title: "Logo Loja",
  type: "object",
  properties: {
    src: { title: "Caminho do logo", type: "string" },
    alt: { title: "Texto alternativo", type: "string", default: "Celdom" },
    href: { title: "Link do logo", type: "string", default: "/" },
    width: { title: "Largura da imagem", type: "number", default: "auto" },
    height: { title: "Altura da imagem", type: "number", default: "auto" }
  },
}

export default LogoLoja;
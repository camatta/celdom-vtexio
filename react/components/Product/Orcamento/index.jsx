import React, { useState } from 'react'

const Orcamento = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        email: '',
        mensagem: ''
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            // Preparar dados para envio
            const orcamentoData = {
                nome: formData.nome,
                whatsapp: formData.whatsapp,
                email: formData.email,
                mensagem: formData.mensagem,
                dataEnvio: new Date().toISOString(),
                status: 'pending'
            }

            console.log('Enviando dados:', orcamentoData)


            const response = await fetch('/api/dataentities/OR/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.vtex.ds.v10+json',
                    'REST-Range': 'resources=0-49'
                },
                body: JSON.stringify(orcamentoData)
            })

            console.log('Response status:', response.status)

            if (response.ok) {
                const result = await response.json()
                console.log('Orçamento salvo com sucesso:', result)
                
                alert('Orçamento enviado com sucesso! Entraremos em contato em breve.')
                

                setIsModalOpen(false)
                setFormData({
                    nome: '',
                    whatsapp: '',
                    email: '',
                    mensagem: ''
                })
            } else {
                const errorText = await response.text()
                console.error('Erro na resposta:', errorText)
                throw new Error(`Erro ${response.status}: ${errorText}`)
            }
            
        } catch (error) {
            console.error('Erro ao enviar orçamento:', error)
            alert('Erro ao enviar orçamento. Por favor, tente novamente ou entre em contato conosco.')
        } finally {
            setIsLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div>
            <button
                style={{
                    border: `1px solid ${isHovering ? '#FE5000' : '#CCCCCC'}`,
                    borderRadius: '40px',
                    color: '#2D2926',
                    fontWeight: 700,
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    width: '100%',
                    height: '32px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'border 0.3s ease, opacity 0.3s ease',
                    fontFamily: 'DM Sans, sans-serif',
                    display:'none'
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setIsModalOpen(true)}
            >
                Solicitar Orçamento
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10000
                    }}
                    onClick={closeModal}
                >
                    {/* Modal Content */}
                    <div 
                        style={{
                            backgroundColor: '#F8F8F8',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '466px',
                            padding: '35px 39px',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão de Fechar */}
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px',
                                lineHeight: 1
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="#1C1B1F"/>
                            </svg>
                        </button>

                        {/* Título */}
                        <h2 style={{
                            margin: '0 0 30px 0',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#2D2926',
                            textAlign: 'left',
                            fontFamily: 'DM Sans, sans-serif'
                        }}>
                            Solicitar orçamento
                        </h2>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* Campo Nome */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    placeholder="Nome"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        height: '41px',
                                        padding: '15px 20px',
                                        border: '1px solid #FE5000',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#2D2926',
                                        fontFamily: 'DM Sans, sans-serif',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                />
                            </div>

                            {/* Campo WhatsApp */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    placeholder="WhatsApp"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        height: '41px',
                                        padding: '15px 20px',
                                        border: '1px solid #FE5000',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#2D2926',
                                        fontFamily: 'DM Sans, sans-serif',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                />
                            </div>

                            {/* Campo Email */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                    required
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        height: '41px',
                                        padding: '15px 20px',
                                        border: '1px solid #FE5000',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#2D2926',
                                        fontFamily: 'DM Sans, sans-serif',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                />
                            </div>

                            {/* Campo Mensagem */}
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    name="mensagem"
                                    value={formData.mensagem}
                                    onChange={handleInputChange}
                                    placeholder="Mensagem"
                                    rows="4"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        minHeight: '104px',
                                        padding: '15px 20px',
                                        border: '1px solid #FE5000',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        fontFamily: 'DM Sans, sans-serif',
                                        color: '#2D2926',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                />
                            </div>

                            {/* Botão Finalizar */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    maxWidth: '100%',
                                    width: '100%',
                                    height: '45px',
                                    backgroundColor: isLoading ? '#ccc' : '#FE5000',
                                    border: 'none',
                                    borderRadius: '25px',
                                    color: '#000',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    marginTop: '10px',
                                    transition: 'background-color 0.3s ease',
                                    outline: 'none',
                                    fontFamily: 'DM Sans, sans-serif',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) e.target.style.backgroundColor = '#E24700'
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) e.target.style.backgroundColor = '#FE5000'
                                }}
                            >
                                {isLoading ? 'Enviando...' : 'Finalizar solicitação'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orcamento
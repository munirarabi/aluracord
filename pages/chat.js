import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js';
import Loading from '../src/components/Loading';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

const SUPABASE_URL = 'https://aejkfhzodlzfufclwqhu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ3NDEyNCwiZXhwIjoxOTU5MDUwMTI0fQ.B1K7M69nw6M8HR2vO0Q3DPr5l4CMRv-YcxZdh5DzfTc'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function listenerMessageRealtime(addMessage) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (responseLive) => {
            addMessage(responseLive.new)
        })
        .subscribe()
}

export default function ChatPage() {
    const route = useRouter()
    const usuarioLogado = route.query.username
    const [mensagem, setMensagem] = React.useState('')
    const [listaDeMensagens, setListaDeMensagens] = React.useState([])

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setListaDeMensagens(data)
            })

        listenerMessageRealtime((novaMensagem) => {
            setListaDeMensagens((valueLista) => {
                return [
                    novaMensagem,
                    ...valueLista,
                ]
            })
        })
    }, [])

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supabaseClient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then(({ data }) => {
                // setListaDeMensagens([
                //     data[0],
                //     ...listaDeMensagens,
                // ])
            })

        setMensagem('')
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {
                        listaDeMensagens == '' ? <Loading /> : <MessageList mensagens={listaDeMensagens} />
                    }
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={
                                (event) => {
                                    setMensagem(event.target.value)
                                }
                            }
                            onKeyPress={
                                (event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault()
                                        handleNovaMensagem(mensagem)
                                    }
                                }
                            }
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '90%',
                                fontSize: '15px',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '5.5px 8px',
                                placeholder: 'red',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                // console.log('salva esse sticker no banco')
                                handleNovaMensagem(':sticker:' + sticker)
                            }}
                        />
                        <Button
                            variant='secondary'
                            colorVariant='light'
                            label='Enviar'
                            onClick={() => {
                                handleNovaMensagem(mensagem)
                            }}
                            styleSheet={{
                                width: '10%',
                                border: '0',
                                padding: '13.5px 8px',
                                marginBottom: '7px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/* {mensagem.texto} */}
                        {
                            mensagem.texto.startsWith(':sticker:') ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            ) : (
                                mensagem.texto
                            )
                        }
                    </Text>
                )
            })}
        </Box>
    )
}
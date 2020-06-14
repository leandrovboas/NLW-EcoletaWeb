import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react' 
import {Link, useHistory} from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import './styles.css'
import logo from '../../assets/logo.svg'
import api from '../../services/api'
import apiIbge from '../../services/ibge'

interface Item {
    id: number,
    title: string,
    image: string
}

interface IBGEUFResponse{
    sigla: string;
}
interface IBGECityResponse{
    nome: string;
}


const CreatePoint = () => {
const [items, setItems] = useState<Item[]>([])
const [ufs, setUfs] = useState<string[]>([]) 
const [cities, setCities] = useState<string[]>([]) 
const [selectedUF, setSelectedUF] = useState('0') 
const [selectedCity, setSelectedCity] = useState('0')
const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
const [selectedItems, setSelectedItems] = useState<number[]>([])
const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
const [formData, setFormData] = useState({
    name: '',
    email: '',
    watsapp: '',
})

const history = useHistory()

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])
  
    useEffect(() => {
        apiIbge.get<IBGEUFResponse[]>('estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials)
        })
    }, [])
    
    useEffect(() => {
        if(selectedUF === '0') return

        apiIbge.get<IBGECityResponse[]>(`estados/${selectedUF}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames)
        })
    }, [selectedUF])

    useEffect(() => {
        if(selectedCity === '0') return

        apiIbge.get<IBGECityResponse[]>(`estados/${selectedUF}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames)
        })
    }, [selectedUF])

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition( position => {
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    })

    function handleSelectedUf (event: ChangeEvent<HTMLSelectElement>){
        setSelectedUF(event.target.value)
    }

    function handleSelectedCity (event: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(event.target.value)
    }

    function handleMapClick ( event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat, 
            event.latlng.lng
        ])
    }

    function handleImnutChange (event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target
        setFormData({...formData, [name]: value})
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item == id)
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item != id)
            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()

        const {name, email, watsapp} = formData
        const uf = selectedUF
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = {
            name,
            email,
            watsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points', data)
        alert("ponto criado")

         history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src = {logo} alt= "Ecoleta"></img>
                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>
            <form onSubmit= {handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name" >Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleImnutChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                        <label htmlFor="email" >E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleImnutChange}/>
                        </div> 
                        <div className="field">
                        <label htmlFor="watsapp" >Watsapp</label>
                            <input type="text" name="watsapp" id="watsapp" onChange={handleImnutChange}/>
                        </div> 
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={[-23.6420983, -46.6029821]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Esdado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectedUf}>
                                <option value="0">Selecione um UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city"  value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                            <img src={item.image} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
        
    )
}

export default CreatePoint
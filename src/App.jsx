import { useState, useEffect } from 'react'

import { APPT_NO_SHOW, MISSED_GUEST, PAID_PASS, RFC, WEB_LEAD } from '../app/util/TextTemplate.json'

const App = () => {

    const [sortBy, setSortBy] = useState('')
    const [user, setUser] = useState('SETH')
    const [bucket, setBucket] = useState('RFC')
    const [message, setMessage] = useState('')
    const [textAmount, setTextAmount] = useState(1)
    const [previousContact, setPreviousContact] = useState(1)
    const [template, setTemplate] = useState('APPT_NO_SHOW')
    
    const [sentTexts, setSentTexts] = useState([])

    const sendTextButton = async (e) => {
        e.preventDefault()
        await window.api.dispatchTexts({ bucket, message, textAmount, previousContact, sortBy, user })
    }

    useEffect(() => {
        setMessage(`Hey this is ${user.charAt(0).toUpperCase() + user.slice(1).toLowerCase()} from the Edge!`)
    }, [user])

    useEffect(() => {
        if(template === "") return
        if(template === 'APPT_NO_SHOW') {
            setMessage(message + APPT_NO_SHOW)
        } else if(template === 'PAID_PASS') {
            setMessage(message + PAID_PASS)
        } else if(template === 'MISSED_GUEST') {
            setMessage(message + MISSED_GUEST)
        } else if(template === 'RFC') {
            setMessage(message + RFC)
        } else if(template === 'WEB_LEAD') {
            setMessage(message + WEB_LEAD)
        }
    }, [template])

    return (
        <div className='flex flex-col w-full h-screen bg-zinc-200'>
            <div id='formData' className='p-2'>
                <form className='w-full' onSubmit={sendTextButton}>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} className='rounded-xl w-full h-24 px-2' maxLength={300} placeholder='Text to send!'></textarea>
                    <div className='py-1' />
                    <div className='flex w-full justify-center items-center'>
                        <label className='pr-1 pl-1'>User: </label>
                        <select value={user} onChange={(e) => setUser(e.target.value)}>
                            <option value={"SETH"}>Seth</option>
                            <option value={"ALEX"}>Alex</option>
                            <option value={"LEVI"}>Levi</option>
                            <option value={"MIKAYLA"}>Mikayla</option>
                        </select>
                        <label className='pr-1 pl-1'>Bucket:</label>
                        <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
                            <option value={'RFC'}>RFC</option>
                            <option value={'GUEST_OF_TOTAL'}>Guest of Total</option>
                            <option value={'WEB_LEAD'}>Web Lead</option>
                            <option value={'MISSED_GUEST'}>Missed Guest</option>
                            <option value={'APPT_NO_SHOW'}>Appt no Show</option>
                        </select>
                        <label className='pr-1 pl-1'>Sort by:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value={'DEFAULT'}>Default</option>
                            <option value={'CREATED_ASC'}>Created date asc</option>
                            <option value={'CREATED_DESC'}>Created date desc</option>
                        </select>
                        <label className='pr-1 pl-1'>Previous contact:</label>
                        <select value={previousContact} onChange={(e) => setPreviousContact(e.target.value)}>
                            <option value={1}>1 Day Ago</option>
                            <option value={2}>2 Days Ago</option>
                            <option value={3}>3 Days Ago</option>
                            <option value={4}>4 Days Ago</option>
                            <option value={5}>5 Days Ago</option>
                            <option value={6}>6 Days Ago</option>
                            <option value={7}>7 Days Ago</option>
                            <option value={8}>8 Days Ago</option>
                            <option value={9}>9 Days Ago</option>
                            <option value={10}>10 Days Ago</option>
                            <option value={11}>11 Days Ago</option>
                            <option value={12}>12 Days Ago</option>
                            <option value={13}>13 Days Ago</option>
                            <option value={14}>14 Days Ago</option>
                        </select>
                        <label className='pr-1 pl-1'>Text template:</label>
                        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                            <option value={"APPT_NO_SHOW"}>Appt no show</option>
                            <option value={"PAID_PASS"}>Paid pass</option>
                            <option value={"MISSED_GUEST"}>Missed guest</option>
                            <option value={"RFC"}>RFC</option>
                            <option value={"WEB_LEAD"}>Web lead</option>
                        </select>
                        <label className='pr-1 pl-1'>Text amount:</label>
                        <input type='number' min={1} max={800} value={textAmount} onChange={(e) => setTextAmount(e.target.value)} />
                        <button className='py-1 px-1 rounded-lg bg-zinc-900 text-white ml-4'>Send Texts</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default App
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "./ToDo.scss";
import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';

const ToDo = () => {
    const [arr, setArr] = useState([]);
    const [arrNew, setArrNew] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [inputVal2, setInputVal2] = useState("");
    const [valueItem, setValueItem] = useState("all");
    const [error, setError] = useState('');
    const [editVal, setEditVal] = useState({});
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        handleFiltering();
    }, [arr, valueItem, inputVal2]);
    const getData = async () => {
        try {
            const response = await axios.get("http://localhost:3333/todoArr");
            setArr(response.data);
            setArrNew(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleFiltering = () => {
        let filteredArr = arr;
        if (valueItem === 'checked') {
            filteredArr = arr.filter(el => el.checkedItem);
        } else if (valueItem === 'unchecked') {
            filteredArr = arr.filter(el => !el.checkedItem);
        }
        if (inputVal2.trim().length > 0) {
            let arr3=[];
            filteredArr.map((el)=>{
                let array=el.name.split(" "),l=0;
                console.log(array);
                array.map((el1)=>{
                    if(el1.startsWith(inputVal2)){
                        l=1;
                }
                })
                if(l==1){
                    arr3.push(el)
                }
            })
            filteredArr=arr3;
        }
        setArrNew(filteredArr);
    }

    const foo = async (e) => {
        e.preventDefault();
        if (inputVal.trim().length > 0) {
            if (!arr.some(el => el.name === inputVal)) {
                setError('');
                await axios.post("http://localhost:3333/todoArr", { name: inputVal, checkedItem: false });
                getData();
            } else {
                setError('This item already exists.');
            }
            setInputVal('');
        }
    };

    const zoo = async (item, index) => {
        const changedItem = arrNew.map((el, ind) => {
            if (index === ind) {
                return { ...el, checkedItem: !el.checkedItem };
            }
            return el;
        });
        await axios.put(`http://localhost:3333/todoArr/${item.id}`, changedItem[index]);
        getData()
    };

    const deleteItem = async (index) => {
        await axios.delete(`http://localhost:3333/todoArr/${index}`);
        getData();
    };

    const editItem = async (e) => {
        e.preventDefault();
        if (editVal.name.trim().length > 0) {
            await axios.put(`http://localhost:3333/todoArr/${editVal.id}`, editVal);
            getData();
        }
        setEditVal({});
    };

    const closeSearch = () => {
        setShowSearch(false);
        setInputVal2("");
    }

    return (
        <div className="todo-container">
            <h1 className="todo-title">To Do List</h1>
            <div className="todo-controls">
                <select className="todo-filter" onChange={(e) => { setValueItem(e.target.value) }}>
                    <option value="all">All</option>
                    <option value="checked">Checked</option>
                    <option value="unchecked">Unchecked</option>
                </select>
                {!showSearch ? (
                    <SearchOutlined className='todo-search-icon' onClick={() => setShowSearch(true)} />
                ) : (
                    <div className="todo-search-wrapper">
                        <input className='todo-search' type='text' value={inputVal2} onChange={(e) => { setInputVal2(e.target.value) }} />
                        <CloseCircleFilled onClick={() => { closeSearch() }} />
                    </div>
                )}
            </div>
            <div className="todo-list">
                {arrNew.map((el, index) => (
                    <div className={`todo-item ${el.checkedItem ? 'checked' : ''}`} key={index}>
                        <input type="checkbox" checked={el.checkedItem} onChange={() => { zoo(el, index) }} />
                        {el.id !== editVal.id ? (
                            <label className='todo-text'>{el.name}</label>
                        ) : (
                            <form onSubmit={(e) => editItem(e)}>
                                <input type="text" className="edit-input" value={editVal.name} onChange={(e) => { setEditVal({ ...editVal, name: e.target.value }) }} />
                            </form>
                        )}
                        <div className="todo-buttons">
                            <button className='todo-delete' onClick={() => deleteItem(el.id)}>Delete</button>
                            <button className='todo-edit' onClick={() => setEditVal(el)}>Edit</button>
                        </div>
                    </div>
                ))}
            </div>
            {!editVal.name?.length && (
                <form onSubmit={foo} className="todo-add-form">
                    <input className='todo-input' type='text' value={inputVal} onChange={(e) => { setInputVal(e.target.value) }} placeholder="Add a new task" />
                </form>
            )}
            <p className="error-message">{error}</p>
        </div>
    );
};

export default ToDo;

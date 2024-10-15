import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { AiOutlineClose } from "react-icons/ai";
import { BsDash } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

import burgues from '../assets/burguers.png';
import dress from '../assets/dress.png';
import drinks from '../assets/drinks.png';
import { LuTrash } from "react-icons/lu";

export default function Home() {
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedAdditions, setSelectedAdditions] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const response = await axios.get('/api/challenge/menu');
                setMenuData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, []);




    const handleItemClick = (item) => {
        const isDrink = menuData.sections.some(section => section.name === 'Drinks' && section.items.includes(item));

        setSelectedItem({
            ...item,
            additions: isDrink ? [] : item.additions || [{ name: 'Cheese', price: 0.5 }, { name: 'Bacon', price: 1.0 }],
            extras: isDrink ? [] : item.extras || item.modifiers || [],
        });
        setShowPopup(true);
        resetSelection();
    };


    const sectionImages = {
        "Burgers": burgues,
        "Drinks": drinks,
        "Desserts": dress,
    };

    const resetSelection = () => {
        setQuantity(1);
        setSelectedAdditions([]);
        setSelectedExtras([]);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedItem(null);
    };

    const handleAddToCart = () => {
        const additionalPrice = calculateTotalPrice(selectedItem.additions, selectedAdditions);
        const extraPrice = calculateTotalPrice(selectedItem.extras, selectedExtras);
        const totalPrice = (selectedItem.price + additionalPrice + extraPrice) * quantity;

        setCart(prevCart => [
            ...prevCart,
            {
                item: selectedItem,
                quantity,
                totalPrice,
                additions: selectedItem.type === 'Drinks' ? [] : selectedAdditions,
                extras: selectedItem.type === 'Drinks' ? [] : selectedExtras,
            },
        ]);
        handleClosePopup();
    };

    const handleQuantityChangeInCart = (index, newQuantity) => {
        setCart(prevCart => prevCart.map((item, i) => {
            if (i === index) {
                const additionalPrice = calculateTotalPrice(item.item.additions, item.additions);
                const extraPrice = calculateTotalPrice(item.item.extras, item.extras);
                const totalPrice = (item.item.price + additionalPrice + extraPrice) * newQuantity;
                return { ...item, quantity: Math.max(1, newQuantity), totalPrice };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    };


    const calculateTotalPrice = (items, selections) => {
        return selections.reduce((total, selection) => {
            const item = items.find(item => item.name === selection);
            return total + (item ? item.price : 0);
        }, 0);
    };

    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value));
    };

    const toggleSelection = (selection, setSelection) => {
        setSelection(prev => prev.includes(selection)
            ? prev.filter(s => s !== selection)
            : [...prev, selection]);
    };

    const totalCartPrice = cart.reduce((total, cartItem) => total + cartItem.totalPrice, 0);

    const filteredSections = menuData?.sections?.map(section => ({
        ...section,
        items: section.items?.filter(item =>
            (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [],
    })).filter(section => section.items.length > 0);



    if (loading) return (
        <div className='d-flex justify-center text-center w-full h-full'>
            <p className='font-semibold'>Loading...</p>
        </div>
    );
    if (error) return <p>Error: {error.message}</p>;
    if (!menuData) return null;

    return (
        <div>
            <div className='flex justify-center items-center bg-gray-50'>
                <div className='flex flex-col lg:flex-row justify-between border p-7 gap-3 shadow-md w-full lg:w-4/5 bg-white'>
                    <div className="itens border shadow-md p-2 w-full lg:w-3/4">
                        <input
                            type="text"
                            placeholder="Pesquisar no menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border rounded p-2 mb-4 w-full"
                        />


                        <div className="menu flex flex-wrap gap-10">
                            {menuData.sections?.map(section => (
                                <li key={section.id} className="mr-4 list-none d-flex text-center">
                                    <img src={sectionImages[section.name]} alt={section.name} className="w-20 h-20 rounded-full" />
                                    <a href={`#section-${section.id}`} className="text-[#121212] hover:underline">
                                        {section.name}
                                    </a>
                                </li>
                            ))}
                        </div>


                        <div className="menu-sections">

                            {filteredSections?.map(section => {
                                if (section.name === "Burgers") {
                                    return (
                                        <div key={section.id} id={`section-${section.id}`} className="mb-8">
                                            <h2 className="text-2xl font-bold mb-4">{section.name}</h2>
                                            <div>
                                                {section.items?.map(item => {
                                                    const cartItem = cart.find(cartItem => cartItem.item.id === item.id);
                                                    const quantityInCart = cartItem ? cartItem.quantity : 0;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="menu-item flex justify-between p-4 w-full h-[150px] cursor-pointer mb-10 border rounded-md shadow-md"
                                                            onClick={() => handleItemClick(item)}
                                                        >
                                                            <div className="flex flex-col justify-center w-2/3 overflow-hidden">
                                                                <h3 className="text-xl font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    {quantityInCart > 0 && (
                                                                        <span
                                                                            className="inline-flex items-center bg-[#4F372F] justify-center border border-gray-300 bg-brown-500 text-white w-6 h-6 rounded-md ml-2"
                                                                        >
                                                                            {quantityInCart}
                                                                        </span>
                                                                    )}
                                                                    {item.name}
                                                                </h3>
                                                                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    {item.description}
                                                                </p>
                                                                <p className="font-bold">Price: ${item.price.toFixed(2)}</p>
                                                            </div>
                                                            {item.images?.length > 0 && (
                                                                <img
                                                                    src={item.images[0].image}
                                                                    alt={item.name}
                                                                    className="w-24 h-24 object-cover rounded-md"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                            {filteredSections?.map(section => {
                                if (section.name === "Drinks") {
                                    return (
                                        <div key={section.id} id={`section-${section.id}`} className="mb-8">
                                            <h2 className="text-2xl font-bold mb-4">{section.name}</h2>
                                            <div>
                                                {section.items?.map(item => {
                                                    const cartItem = cart.find(cartItem => cartItem.item.id === item.id);
                                                    const quantityInCart = cartItem ? cartItem.quantity : 0;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="mb-10"
                                                            onClick={() => handleItemClick(item)}
                                                        >
                                                            <div className="flex flex-col justify-center w-2/3 overflow-hidden">
                                                                <h3 className="text-[16px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    {quantityInCart > 0 && (
                                                                        <span
                                                                            className="inline-flex items-center bg-[#4F372F] justify-center border border-gray-300 bg-brown-500 text-white w-6 h-6 rounded-md ml-2"
                                                                        >
                                                                            {quantityInCart}
                                                                        </span>
                                                                    )}
                                                                    {item.name}
                                                                </h3>
                                                                <p className="font-medium">Price: ${item.price.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                        </div>
                    </div>



                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowCart(prev => !prev)}
                            className="bg-[#4F372F] text-white rounded-full px-4 py-2">
                            Carrinho ({cart.length})
                        </button>
                    </div>

                    <div className="cart border w-full lg:w-64 max-h-[50vh] flex flex-col shadow-md bg-white">
                        <div className="w-full h-[50px] flex justify-center items-center bg-[#F8F9FA]">
                            <h2 className="font-bold">Carrinho</h2>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {cart.length === 0 ? (
                                <p>O carrinho está vazio.</p>
                            ) : (
                                <ul>
                                    {cart.map((cartItem, index) => (
                                        <li key={index} className="mb-4 border-b border-gray-300 pb-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{cartItem.item.name}</span>
                                                    {cartItem.additions.length > 0 && (
                                                        <p className="text-sm text-gray-600">Adições: {cartItem.additions.join(', ')}</p>
                                                    )}
                                                    {cartItem.extras.length > 0 && (
                                                        <p className="text-sm text-gray-600">Extras: {cartItem.extras.join(', ')}</p>
                                                    )}

                                                    <div className="flex items-center mt-2">
                                                        <button
                                                            className="text-black text-xl px-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                                                            onClick={() => handleQuantityChangeInCart(index, cartItem.quantity - 1)}
                                                        >
                                                            <BsDash />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={cartItem.quantity}
                                                            onChange={(e) => handleQuantityChangeInCart(index, Math.max(1, e.target.value))}
                                                            className="text-center text-xl w-10 mx-2 inputNumberNoSpin border rounded"
                                                        />
                                                        <button
                                                            className="text-white text-xl px-2 rounded-full bg-orange-950 hover:bg-orange-700 transition-colors duration-200"
                                                            onClick={() => handleQuantityChangeInCart(index, cartItem.quantity + 1)}
                                                        >
                                                            <GoPlus />
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    className="text-red-600 ml-4 hover:text-red-800 transition-colors duration-200"
                                                    onClick={() => handleRemoveFromCart(index)}
                                                >
                                                    <LuTrash />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className='border-t p-2 flex justify-between items-center h-[50px] bg-[#F8F9FA]'>
                            <h3 className="font-light text-2xl">Total:</h3>
                            <div className="font-bold">${totalCartPrice.toFixed(2)}</div>
                        </div>
                    </div>

                </div>
            </div>

            {showPopup && (
                <div className="popup fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow-md w-[400px] h-[500px] relative flex flex-col">

                        <div className='absolute  top-2 right-4 p-1 bg-[#4F372F] rounded-full w-10 h-10 d-flex flex justify-center items-center'>
                            <button
                                onClick={handleClosePopup}
                                className=" text-white hover:text-red-500 focus:outline-none"
                            >
                                <AiOutlineClose />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                            {selectedItem.images && selectedItem.images.length > 0 && (
                                <img
                                    src={selectedItem.images[0].image}
                                    alt={selectedItem.name}
                                    className="w-full h-32 object-cover rounded mb-4"
                                />
                            )}

                            <div>
                                <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
                                <p>{selectedItem.description}</p>
                                <p className="font-bold">Preço: ${selectedItem.price.toFixed(2)}</p>

                                {/* Adições */}
                                {selectedItem.additions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold">Adições:</h4>
                                        {selectedItem.additions.map(addition => (
                                            <label key={addition.name} className="block">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex">
                                                        <span>{addition.name}</span>
                                                        <span className="ml-2">(+${addition.price.toFixed(2)})</span>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAdditions.includes(addition.name)}
                                                        onChange={() => toggleSelection(addition.name, setSelectedAdditions)}
                                                        className="ml-4"
                                                    />
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}


                                {selectedItem.modifiers && selectedItem.modifiers.length > 0 && (
                                    <div className="mt-4">
                                        {selectedItem.modifiers.map(modifier => (
                                            <div key={modifier.name}>
                                                <h5 className="font-semibold">{modifier.name}</h5>
                                                {modifier.items.map(item => (
                                                    <label key={item.name} className="block">

                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-col">
                                                                <span>{item.name}</span>
                                                                <span>+${item.price ? item.price.toFixed(2) : '0.00'}</span>
                                                            </div>

                                                            <input
                                                                type="checkbox"
                                                                checked={selectedExtras.includes(item.name)}
                                                                onChange={() => toggleSelection(item.name, setSelectedExtras)}
                                                                className="ml-4 rounded-full"
                                                            />
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>



                        <div className="border-t p-4 bg-white/30 backdrop-blur-lg">

                            <div className="flex items-center justify-center mb-4">
                                <button
                                    className="text-black text-xl px-2 rounded-full bg-gray-200"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="text-center text-xl w-10 ml-2 inputNumberNoSpin"
                                    min="1"
                                />
                                <button
                                    className="text-white text-xl px-2 rounded-full bg-orange-950"
                                    onClick={() => setQuantity(prev => prev + 1)}
                                >
                                    +
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleAddToCart}
                                    className="bg-[#4F372F] text-white rounded-full px-4 py-2 w-full"
                                >
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

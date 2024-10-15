import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-[#4F372F] text-white h-16 flex items-center px-4 relative">

      <div className="absolute left-0 right-0 text-right p-4 md:hidden">
        <button onClick={toggleMenu} className="text-3xl focus:outline-none">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Links de navegação */}
      <div className={`md:flex gap-8 items-center ${isOpen ? 'block' : 'hidden'} md:static absolute top-16 left-0 w-full  bg-[#4F372F] md:bg-transparent md:h-auto h-screen md:flex-row flex flex-col justify-center`}>

        <li className="list-none text-center py-2 md:py-0">
          <a href="" className="text-lg hover:underline">Menu</a>
        </li>
        <li className="list-none text-center py-2 md:py-0">
          <a href="" className="text-lg hover:underline">Entrar</a>
        </li>
        <li className="list-none text-center py-2 md:py-0">
          <a href="" className="text-lg hover:underline">Contato</a>
        </li>
      </div>
    </div>
  );
}

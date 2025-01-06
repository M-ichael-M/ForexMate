import React, { Component } from 'react';

class LeftSide extends Component {
  render() {
    return (
      <div className="flex-1 bg-cover bg-center bg-no-repeat px-12"
           style={{ backgroundImage: "url('/Cash.jpg')" }}>
        <div className="flex justify-center items-center h-full">
          <div className="text-white bg-black bg-opacity-80 p-8 rounded-lg">
            <img src="/white_logo.png" alt="Black Logo" />
            <h1 className="text-4xl font-bold">ForexMate</h1>
            <p className="text-lg">Michał Małeczek</p>
            <p className="text-lg">CEO</p>
            <p className="text-base">Komplekosowa platforma pomagająca ci w zarządzaniu finansami!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default LeftSide;

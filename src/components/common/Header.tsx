
import { useState } from 'react';

const Header = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = () => {
    // 在这里添加连接钱包的逻辑
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="logo">
        <a href="/" className="text-xl font-bold">
          My DApp
        </a>
      </div>
      <nav className="navigation">
        <ul className="flex">
          <li className="mr-4">
            <a href="/" className="hover:text-gray-400">
              首页
            </a>
          </li>
          <li className="mr-4">
            <a href="/dapp" className="hover:text-gray-400">
              DApp
            </a>
          </li>
        </ul>
      </nav>
      <div className="wallet-connect">
        <button
          onClick={handleWalletConnect}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isWalletConnected ? '断开连接' : '连接钱包'}
        </button>
      </div>
    </header>
  );
};

export default Header;
import { useState, useEffect, useCallback } from 'react'
import { Contract } from 'ethers'
import { hooks } from '@/connections/metaMask';

import { BigNumber } from '@ethersproject/bignumber'
import SavingDefiABI from '@abis/SavingDefi.json';
import { formatEther, parseEther } from '@ethersproject/units'

interface DepositInfo {
  amount: BigNumber
  timestamp: BigNumber
  lastInterestCalculation: BigNumber
}

export default function DefiContractInterface() {
  const { useProvider, useAccounts,useChainId } = hooks;
  const accounts = useAccounts();
  const account = accounts?.[0];
  const provider = useProvider();

  // 修改合约地址获取方式，动态适配网络
  const chainId = useChainId();

  const [contract, setContract] = useState<Contract>()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [userDepositInfo, setUserDepositInfo] = useState<DepositInfo>()
  const [contractBalance, setContractBalance] = useState<BigNumber>(BigNumber.from(0))
  const [totalBalance,setTotalBalance] = useState<BigNumber>(BigNumber.from(0))
  // 使用异步调用方式获取合约常量
  const [maxWithdraw, setMaxWithdraw] = useState<string>('0');
  const [annualInterestRate, setAnnualInterestRate] = useState<string>('0');

  // 合约初始化
  useEffect(() => {
    if (provider && account && chainId) {
      console.log('chainId',chainId)
      try {
        const signer = provider.getSigner();
        const networkConfig = SavingDefiABI.networks[chainId];
        
        if (!networkConfig?.address) {
          throw new Error(`未找到 ${chainId} 网络的合约配置`);
        }
  
        const contract = new Contract(networkConfig.address, SavingDefiABI.abi, signer);
        setContract(contract);
        console.log('contract',contract)


        refreshContractConstants()
        refreshData();
      } catch (error) {
        console.error('合约初始化失败:', error);
        alert(`当前网络未支持，请切换至已部署合约的网络`);
      }
    }
  }, [provider, account, chainId])

  const refreshContractConstants = useCallback(async () => {
    if (contract) {
      const maxWithdraw = await contract.MAX_WITHDRAWAL_PERCENTAGE()
      const annualInterestRate = await contract.ANNUAL_INTEREST_RATE()
      console.log('maxWithdraw',maxWithdraw,annualInterestRate)
      setMaxWithdraw(maxWithdraw.toString())
      setAnnualInterestRate(annualInterestRate.toString())
    }
  },[contract])
  // 刷新所有数据
  const refreshData = async () => {
    if (contract && account) {
      try {
        const [depositInfo, contractBalance, totalBalance] = await Promise.all([
          contract.deposits(account),
          contract.getContractBalance(),
          contract.getTotalBalance(account)
        ])
        console.log(depositInfo, contractBalance,totalBalance)
        setUserDepositInfo({
          amount: depositInfo.amount,
          timestamp: depositInfo.timestamp,
          lastInterestCalculation: depositInfo.lastInterestCalculation
        })
        setContractBalance(contractBalance)
        // 获取总余额
        setTotalBalance(totalBalance)
      } catch (error) {
        console.error('数据刷新失败:', error)
      }
    }
  }

  // 存款处理
  const handleDeposit = async () => {
    if (!contract || !depositAmount) return

    try {
      const value = parseEther(depositAmount)
      if (value.lte(0)) {
        alert('存款金额必须大于 0')
        return
      }
      console.log('🚀 ~ handleDeposit ~ tx:', 1123)
      const tx = await contract.deposit({ value })
      
      console.log('🚀 ~ handleDeposit ~ tx:', tx)
      await tx.wait()
      await refreshData()
      setDepositAmount('')
    } catch (error: any) {
      console.error('存款失败:', error)
      alert(`交易失败: ${error?.message || '未知错误'}`)
    }
  }

  // 提现处理
  const handleWithdraw = async (isFull: boolean) => {
    if (!contract || !userDepositInfo) return

    try {
      let amount: BigNumber
      if (isFull) {
        amount = await contract.getTotalBalance(account)
      } else {
        if (!withdrawAmount) {
          alert('请输入提现金额')
          return
        }
        amount = parseEther(withdrawAmount)
      }

      if (amount.lte(0)) {
        alert('提现金额必须大于 0')
        return
      }

      const tx = await contract.withdraw(amount)
      await tx.wait()
      await refreshData()
      setWithdrawAmount('')
    } catch (error: any) {
      console.error('提现失败:', error)
      alert(`交易失败: ${error?.message || '未知错误'}`)
    }
  }

  // 计算利息
  const calculateInterest = async () => {
    if (!contract || !account) return

    try {
      const interest = await contract.calculateInterest(account)
      alert(`累计利息: ${formatEther(interest)} ETH`)
    } catch (error) {
      console.error('利息计算失败:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-gray-50 rounded-xl shadow-lg">
      {/* 账户概览 */}
      <div className="p-4 bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">账户概览</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatItem 
            label="总余额" 
            value={formatEther(totalBalance)} 
          />
          <StatItem 
            label="合约余额" 
            value={formatEther(contractBalance)} 
          />
        </div>
      </div>

      {/* 存款表单 */}
      <div className="p-4 bg-white rounded-lg">
        <h3 className="text-lg font-medium mb-3">存款</h3>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.0001"
            className="flex-1 p-2 border rounded"
            placeholder="ETH 金额"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button
            onClick={handleDeposit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!depositAmount}
          >
            存入
          </button>
        </div>
      </div>

      {/* 提现表单 */}
      <div className="p-4 bg-white rounded-lg">
        <h3 className="text-lg font-medium mb-3">提现</h3>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.0001"
              className="flex-1 p-2 border rounded"
              placeholder="ETH 金额"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button
              onClick={() => handleWithdraw(false)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={!withdrawAmount}
            >
              提现
            </button>
          </div>
          <button
            onClick={() => handleWithdraw(true)}
            className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            全部提现
          </button>
        </div>
      </div>

      {/* 利率信息 */}
      <div className="p-4 bg-white rounded-lg">
        <h3 className="text-lg font-medium mb-2">利率信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem 
            label="年化利率" 
            value={`${annualInterestRate}%`} 
          />
          {/* ${contract?.ANNUAL_INTEREST_RATE} */}
          <StatItem
            label="最大提现比例"
            value={`${maxWithdraw}%`}
          />
        </div>
        <button
          onClick={calculateInterest}
          className="mt-3 w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          计算利息
        </button>
      </div>
    </div>
  )
}

// 统计项组件
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-gray-500 text-sm">{label}</span>
      <p className="font-mono text-lg">{value} ETH</p>
    </div>
  )
}
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { ethers, parseUnits } from 'ethers';
import { getPaymentDetails } from '../services/api';
import { PaymentDetails } from '../types/payment';
// Declaración de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// ABI mínimo para interactuar con USDC
const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint256)"
];

const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // USDC en Arbitrum
const RECIPIENT_ADDRESS = "0xD0Ed99Bc810906ae152Bc4F1fB7dE4F32D1E9006";
const USDC_DECIMALS = 6; // USDC en Arbitrum usa 6 decimales

const ARBITRUM_CHAIN_ID = '42161';
const ARBITRUM_RPC = 'https://arb1.arbitrum.io/rpc';

const PaymentPage: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [arbitrumProvider] = useState(new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc"));
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (!orderId) {
          throw new Error('No se proporcionó un ID de orden');
        }
        const details = {
          orderId: "1234567890",
          amount: 1,
          token: "USD"
        }
        //const details = await getPaymentDetails(orderId);
        setPaymentDetails(details);
        setError('');
      } catch (err) {
        setError('Error al cargar los detalles del pago');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [orderId]);

  const switchToArbitrum = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(ARBITRUM_CHAIN_ID).toString(16)}` }],
      });
    } catch (switchError: any) {
      // Si la red no está agregada, la agregamos
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${Number(ARBITRUM_CHAIN_ID).toString(16)}`,
                chainName: 'Arbitrum One',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [ARBITRUM_RPC],
                blockExplorerUrls: ['https://arbiscan.io/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Error al agregar la red de Arbitrum');
        }
      } else {
        throw new Error('Error al cambiar a la red de Arbitrum');
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Por favor instala MetaMask para continuar');
      }

      // Solicitar acceso a la cuenta
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Cambiar a la red de Arbitrum
      await switchToArbitrum();
      
      // Crear provider de MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Verificar que estamos en la red correcta
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(ARBITRUM_CHAIN_ID)) {
        throw new Error('Por favor cambia a la red de Arbitrum');
      }
      
      setProvider(provider);
      setSigner(signer);
      setWalletAddress(address);
      
      // Obtener balance de USDC usando el provider de Arbitrum
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, arbitrumProvider);
      const balance = await usdcContract.balanceOf(address);
      setBalance(ethers.formatUnits(balance, USDC_DECIMALS));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar la wallet');
    }
  };

  const sendUSDC = async () => {
    if (!signer) {
      setError('Por favor conecta tu wallet primero');
      return;
    }

    try {
      // Verificar que estamos en la red correcta antes de enviar
      const network = await provider?.getNetwork();
      if (network?.chainId !== BigInt(ARBITRUM_CHAIN_ID)) {
        await switchToArbitrum();
      }

      setLoading(true);
      // Usar el signer de MetaMask para la transacción
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      
      // Convertir el monto del pago a la cantidad correcta de USDC
      const amount = parseUnits("1", USDC_DECIMALS);
      
      const tx = await usdcContract.transfer(RECIPIENT_ADDRESS, amount);
      console.log('tx', tx);
      
      const receipt = await tx.wait();
      console.log('receipt', receipt);
      if (receipt) {
        setShowSuccess(true);
        // llamar al endpoint de bridge
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar USDC');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pago con USDC en Arbitrum
          </Typography>

          {!walletAddress ? (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={connectWallet}
              sx={{ mt: 2 }}
            >
              Conectar Wallet
            </Button>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Wallet Conectada:</Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>{walletAddress}</Typography>
                <Typography variant="h6">ID de Orden:</Typography>
                <Typography>{paymentDetails?.orderId}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Monto:</Typography>
                <Typography>{paymentDetails?.amount} {paymentDetails?.token}</Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={sendUSDC}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Enviar USD'}
              </Button>
            </>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">
        Pago procesado exitosamente
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentPage; 
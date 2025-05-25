import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import CreatePaymentLink from './pages/CreatePaymentLink';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Pagos
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Crear Pago
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route path="/" element={<CreatePaymentLink />} />
          <Route path="/pay/:orderId" element={<PaymentPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

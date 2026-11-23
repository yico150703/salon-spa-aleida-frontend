import React, { useState, useEffect } from 'react';
import { api } from '../api';
import CashAuditModal from './CashAuditModal';
import ElectronicReceiptModal from './ElectronicReceiptModal';
import ClientFileModal from './ClientFileModal';
import ClientRegisterModal from './ClientRegisterModal';
import AppointmentModal from './AppointmentModal';
import { PersonalManager, CatalogoManager, AperturasCaja } from './UseCaseModules';
import { 
  CalendarIcon, UsersIcon, UserIcon, CreditCardIcon, SlashIcon, LockIcon, 
  BoxIcon, TagIcon, ShieldIcon, ChartIcon, TargetIcon, SearchIcon, 
  DollarIcon
} from './Icons';

// Matriz de Control de Acceso Basada en Roles (RBAC) para Salon Spa Aleida
// Estrictamente alineada a los Casos de Uso del Sistema (CUS) y Actores del Modelo Rational Rose
const ROLE_PERMISSIONS = {
  Administrador: {
    nombre: 'Administrador',
    badgeText: 'Administrador',
    badgeFull: 'Administrador · Parámetros y Supervisión',
    badgeClass: 'rol-admin',
    descripcion: 'Gestión de personal, mantenimiento de catálogo y tarifario, autorización de notas de crédito y supervisión de cierre de caja.',
    defaultTab: 'personal',
    sections: [
      {
        label: '1. Gestión & Catálogo',
        tabs: [
          { id: 'personal', label: 'Gestión de Personal', icon: UserIcon },
          { id: 'catalogo', label: 'Catálogo de Servicios', icon: TagIcon }
        ]
      },
      {
        label: '2. Supervisión de Caja',
        tabs: [
          { id: 'anulaciones', label: 'Autorizar Anulaciones y NC', icon: SlashIcon },
          { id: 'operaciones-caja', label: 'Supervisión de Cierre', icon: ChartIcon }
        ]
      }
    ]
  },

  Recepcionista: {
    nombre: 'Recepcionista',
    badgeText: 'Recepcionista',
    badgeFull: 'Área de Recepción · Citas y Clientes',
    badgeClass: 'rol-recepcion',
    descripcion: 'Atención directa en mostrador, agendamiento de citas en cabinas, registro de nuevos clientes y reprogramación o cancelación de citas.',
    defaultTab: 'agenda',
    sections: [
      {
        label: 'Citas & Clientes',
        tabs: [
          { id: 'agenda', label: 'Gestión de Citas', icon: CalendarIcon },
          { id: 'clientes', label: 'Padrón de Clientes', icon: UsersIcon },
          { id: 'reprogramar', label: 'Reprogramar o Cancelar Cita', icon: CalendarIcon }
        ]
      }
    ]
  },

  Cajero: {
    nombre: 'Cajero',
    badgeText: 'Cajero',
    badgeFull: 'Área de Caja · Facturación y Cobro',
    badgeClass: 'rol-cajero',
    descripcion: 'Apertura obligatoria de turno de caja, procesamiento de cobros multicanal, emisión de notas de crédito y arqueo de caja diario.',
    defaultTab: 'apertura',
    sections: [
      {
        label: 'Operaciones de Caja & Facturación',
        tabs: [
          { id: 'apertura', label: 'Aperturar Turno de Caja', icon: LockIcon },
          { id: 'caja', label: 'Procesar Venta y Cobro', icon: CreditCardIcon },
          { id: 'anulaciones', label: 'Emitir Nota de Crédito', icon: SlashIcon },
          { id: 'operaciones-caja', label: 'Arqueo y Cierre de Caja', icon: ChartIcon }
        ]
      }
    ]
  }
};

// =========================================================================
// COMPONENTE: QR DE BILLETERA DIGITAL (YAPE / PLIN)
// =========================================================================
function DigitalWalletQR({
  walletType,
  onWalletTypeChange,
  amount,
  phone = '987 654 321',
  opCode,
  onOpCodeChange,
  isVerified,
  onVerify
}) {
  const isYape = walletType === 'yape';
  const brandColor = isYape ? '#742284' : '#00A3C4';
  const brandBg = isYape ? '#FAF4FB' : '#F0F9FB';
  const brandName = isYape ? 'Yape' : 'Plin';

  return (
    <div style={{
      background: brandBg,
      border: `2px solid ${brandColor}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
    }}>
      {/* Selector de Billetera (Yape vs Plin) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onWalletTypeChange('yape')}
            style={{
              background: isYape ? '#742284' : '#FFFFFF',
              color: isYape ? '#FFFFFF' : '#742284',
              border: '1px solid #742284',
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            YAPE
          </button>
          <button
            type="button"
            onClick={() => onWalletTypeChange('plin')}
            style={{
              background: !isYape ? '#00A3C4' : '#FFFFFF',
              color: !isYape ? '#FFFFFF' : '#00A3C4',
              border: '1px solid #00A3C4',
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            PLIN
          </button>
        </div>

        <div style={{
          background: isVerified ? '#E8F5E9' : '#FFF3E0',
          color: isVerified ? '#2E7D32' : '#E65100',
          fontSize: '0.74rem',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: '12px',
          border: `1px solid ${isVerified ? '#A5D6A7' : '#FFE0B2'}`
        }}>
          {isVerified ? 'Pago Digital Verificado' : 'Escanee para Transferir'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '136px 1fr', gap: '14px', alignItems: 'center' }}>
        {/* QR Gráfico Inventado de Alta Definición */}
        <div style={{
          background: '#FFFFFF',
          padding: '8px',
          borderRadius: '10px',
          border: `1px solid ${brandColor}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" fill="#FFFFFF" rx="4" />
            {/* Finder Superior Izquierdo */}
            <rect x="8" y="8" width="32" height="32" rx="4" stroke={brandColor} strokeWidth="4" fill="none" />
            <rect x="16" y="16" width="16" height="16" rx="2" fill={brandColor} />
            {/* Finder Superior Derecho */}
            <rect x="80" y="8" width="32" height="32" rx="4" stroke={brandColor} strokeWidth="4" fill="none" />
            <rect x="88" y="16" width="16" height="16" rx="2" fill={brandColor} />
            {/* Finder Inferior Izquierdo */}
            <rect x="8" y="80" width="32" height="32" rx="4" stroke={brandColor} strokeWidth="4" fill="none" />
            <rect x="16" y="88" width="16" height="16" rx="2" fill={brandColor} />

            {/* Módulos de datos y alineación */}
            <rect x="46" y="10" width="8" height="8" fill={brandColor} />
            <rect x="58" y="12" width="6" height="6" fill={brandColor} />
            <rect x="68" y="10" width="6" height="8" fill={brandColor} />
            <rect x="46" y="22" width="6" height="10" fill={brandColor} />
            <rect x="56" y="24" width="8" height="6" fill={brandColor} />
            <rect x="68" y="22" width="6" height="10" fill={brandColor} />

            <rect x="10" y="46" width="8" height="8" fill={brandColor} />
            <rect x="22" y="48" width="6" height="6" fill={brandColor} />
            <rect x="32" y="46" width="8" height="8" fill={brandColor} />
            <rect x="80" y="46" width="8" height="8" fill={brandColor} />
            <rect x="92" y="48" width="6" height="6" fill={brandColor} />
            <rect x="102" y="46" width="8" height="8" fill={brandColor} />

            {/* Logo Central de la Billetera */}
            <circle cx="60" cy="60" r="16" fill="#FFFFFF" stroke={brandColor} strokeWidth="3" />
            <circle cx="60" cy="60" r="12" fill={brandColor} />
            <text x="60" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              {isYape ? 'Y' : 'P'}
            </text>

            <rect x="46" y="82" width="8" height="6" fill={brandColor} />
            <rect x="58" y="80" width="6" height="8" fill={brandColor} />
            <rect x="68" y="82" width="8" height="6" fill={brandColor} />
            <rect x="46" y="94" width="6" height="8" fill={brandColor} />
            <rect x="56" y="96" width="8" height="6" fill={brandColor} />
            <rect x="68" y="94" width="6" height="8" fill={brandColor} />

            <rect x="82" y="82" width="6" height="8" fill={brandColor} />
            <rect x="92" y="84" width="8" height="6" fill={brandColor} />
            <rect x="104" y="82" width="6" height="8" fill={brandColor} />
            <rect x="84" y="96" width="8" height="6" fill={brandColor} />
            <rect x="96" y="94" width="6" height="8" fill={brandColor} />
            <rect x="106" y="96" width="6" height="6" fill={brandColor} />
          </svg>
          <span style={{ fontSize: '0.68rem', color: brandColor, fontWeight: 700, marginTop: '4px' }}>
            QR OFICIAL {brandName.toUpperCase()}
          </span>
        </div>

        {/* Información y Validación del Pago */}
        <div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block' }}>Monto a Transferir:</span>
            <strong style={{ fontSize: '1.4rem', color: brandColor, fontWeight: 800 }}>
              S/ {Number(amount).toFixed(2)}
            </strong>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.45', marginBottom: '8px' }}>
            <div>Titular: <strong>Salon Spa Aleida S.A.C.</strong></div>
            <div>Número Celular: <strong>{phone}</strong></div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '2px' }}>
              Código de Operación {brandName} (Confirmación):
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={opCode}
                onChange={(e) => onOpCodeChange(e.target.value)}
                placeholder="Ej. 849201"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  border: `1px solid ${brandColor}`,
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  fontWeight: 600
                }}
              />
              <button
                type="button"
                onClick={onVerify}
                style={{
                  background: isVerified ? '#2E7D32' : brandColor,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isVerified ? 'Verificado' : 'Validar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENTE: FORMULARIO DE TARJETA DE CRÉDITO / DÉBITO POS
// =========================================================================
function CardPaymentForm({
  cardNumber,
  onCardNumberChange,
  cardHolder,
  onCardHolderChange,
  cardExp,
  onCardExpChange,
  cardCvv,
  onCardCvvChange,
  cardType,
  onCardTypeChange,
  cardBrand,
  onCardBrandChange,
  cardInstallments,
  onCardInstallmentsChange,
  cardPosRef,
  amount
}) {
  const clean = (cardNumber || '').replace(/\D/g, '');
  const brand = clean.startsWith('4') 
    ? 'Visa' 
    : (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55'))
    ? 'Mastercard' 
    : (clean.startsWith('34') || clean.startsWith('37'))
    ? 'American Express' 
    : cardBrand || 'Visa';

  return (
    <div style={{
      background: '#F8FAFC',
      border: '1px solid #CBD5E1',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
    }}>
      {/* Encabezado del Cuadro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#1E293B',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '4px',
            letterSpacing: '0.5px'
          }}>
            TERMINAL POS
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
            Datos de Tarjeta Crédito / Débito
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>
          Cifrado Bancario Seguro
        </span>
      </div>

      {/* Campos del Formulario de Tarjeta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            Número de Tarjeta (16 dígitos):
          </label>
          <input
            type="text"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
              const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
              onCardNumberChange(formatted);
              if (v.startsWith('4')) onCardBrandChange('Visa');
              else if (v.startsWith('5')) onCardBrandChange('Mastercard');
              else if (v.startsWith('3')) onCardBrandChange('American Express');
            }}
            placeholder="4557 8912 3456 7890"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF'
            }}
            required
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            Nombre del Titular (impreso en la tarjeta):
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => onCardHolderChange(e.target.value.toUpperCase())}
            placeholder="PATRICIA VALDIVIA"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF'
            }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            Vencimiento (MM/AA):
          </label>
          <input
            type="text"
            maxLength={5}
            value={cardExp}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
              onCardExpChange(v);
            }}
            placeholder="08/28"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: 700,
              fontFamily: 'monospace',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF'
            }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            CVV / CVC (3 dígitos):
          </label>
          <input
            type="password"
            maxLength={4}
            value={cardCvv}
            onChange={(e) => onCardCvvChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="382"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '2px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF'
            }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            Tipo de Tarjeta:
          </label>
          <select
            value={cardType}
            onChange={(e) => onCardTypeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 8px',
              fontSize: '0.82rem',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF'
            }}
          >
            <option value="Credito">Crédito</option>
            <option value="Debito">Débito</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '3px' }}>
            Cuotas:
          </label>
          <select
            value={cardInstallments}
            onChange={(e) => onCardInstallmentsChange(e.target.value)}
            disabled={cardType === 'Debito'}
            style={{
              width: '100%',
              padding: '7px 8px',
              fontSize: '0.82rem',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: cardType === 'Debito' ? '#F1F5F9' : '#FFFFFF'
            }}
          >
            <option value="1">1 cuota (Sin intereses)</option>
            <option value="2">2 cuotas</option>
            <option value="3">3 cuotas</option>
            <option value="6">6 cuotas</option>
            <option value="12">12 cuotas</option>
          </select>
        </div>
      </div>

      {/* Referencia Operativa POS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', color: '#475569' }}>
        <span>Lote / Ref POS: <strong>{cardPosRef}</strong></span>
        <span>A Cobrar: <strong style={{ color: '#0F172A' }}>S/ {Number(amount).toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

export default function Dashboard({ 
  citas, 
  clientes, 
  caja, 
  insumos, 
  catalogo, 
  usuarios, 
  ventas = [],
  anulaciones = [],
  currentUser,
  cajaAbierta,
  onAddCita,
  onReprogramCita,
  onCancelCita,
  onChangeCitaEstado,
  onProcessPayment, 
  onAddClient, 
  onSaveClient,
  onProcessAnnulment, 
  onExpense, 
  onCloseCaja,
  onReceiveStock,
  onAddPersonal,
  onAddServicio,
  onAperturaCaja,
  onSwitchToPortal,
  onSwitchToBooking,
  onChangeRole,
  onRefreshCitas,
  onRefreshClientes,
  onRefreshCaja,
  onRefreshAnulaciones,
  showToast 
}) {
  // Resolver configuración de rol
  const userRoleKey = currentUser?.rol?.toLowerCase().includes('recep')
    ? 'Recepcionista'
    : currentUser?.rol?.toLowerCase().includes('caje')
    ? 'Cajero'
    : 'Administrador';

  const roleConfig = ROLE_PERMISSIONS[userRoleKey] || ROLE_PERMISSIONS.Administrador;
  const allowedTabs = roleConfig.sections.flatMap(s => s.tabs.map(t => t.id));

  const [activeTab, setActiveTab] = useState(roleConfig.defaultTab);

  // Fecha operativa actual y filtro de agenda por día
  const todayStr = new Date().toISOString().slice(0, 10);
  const [agendaDateFilter, setAgendaDateFilter] = useState('hoy'); // 'hoy' | 'todas'

  // Auto-ajustar tab si no está permitido para el rol activo
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(roleConfig.defaultTab);
    }
  }, [userRoleKey]);

  // Modals state
  const [isCashAuditOpen, setIsCashAuditOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptType, setReceiptType] = useState('boleta'); // 'boleta' | 'nota_credito'
  const [isClientFileOpen, setIsClientFileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientRegisterModalOpen, setIsClientRegisterModalOpen] = useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Búsqueda y Filtros de Clientes
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [salesHistory, setSalesHistory] = useState([]);

  // POS State
  const [posClient, setPosClient] = useState('Patricia Valdivia');
  const [posService, setPosService] = useState('Facial Rejuvenecedor con Oro');
  const [posAmount, setPosAmount] = useState('450.00');
  const [posExtraProduct, setPosExtraProduct] = useState('0'); // 0, 45 (Serum), 70 (Ampolla)
  const [posDiscount, setPosDiscount] = useState('0'); // 0, 10%
  const [posPaymentMethod, setPosPaymentMethod] = useState('Yape/Plin');
  const [cashGiven, setCashGiven] = useState('500.00'); // para cálculo de vuelto
  const [selectedCitaId, setSelectedCitaId] = useState(null);
  const [alertaInsuficiente, setAlertaInsuficiente] = useState(null);
  const [cargandoCobro, setCargandoCobro] = useState(false);

  // Billetera Digital (QR Yape / Plin) State
  const [digitalWalletType, setDigitalWalletType] = useState('yape'); // 'yape' | 'plin'
  const [walletOpCode, setWalletOpCode] = useState('849201');
  const [walletVerified, setWalletVerified] = useState(false);

  // Tarjeta Crédito / Débito POS State
  const [cardNumber, setCardNumber] = useState('4557 8912 3456 7890');
  const [cardHolder, setCardHolder] = useState('PATRICIA VALDIVIA');
  const [cardExp, setCardExp] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [cardType, setCardType] = useState('Credito'); // 'Credito' | 'Debito'
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardInstallments, setCardInstallments] = useState('1');
  const [cardPosRef, setCardPosRef] = useState('POS-482109');

  // Sincronizar titular de tarjeta al seleccionar cliente
  useEffect(() => {
    if (posClient) {
      setCardHolder(posClient.toUpperCase());
    }
  }, [posClient]);

  // CUS-09: Anular Venta con Nota de Crédito (Diagrama BCE Oficial)
  const [annulTicket, setAnnulTicket] = useState('B001-0004820');
  const [annulPin, setAnnulPin] = useState('1234');
  const [annulMotivo, setAnnulMotivo] = useState('Error en digitación de importe');
  const [annulCliente, setAnnulCliente] = useState('Mariana Torres');
  const [annulMonto, setAnnulMonto] = useState('280.00');
  const [annulMedio, setAnnulMedio] = useState('Efectivo');
  const [annulServicio, setAnnulServicio] = useState('Masaje Relajante Aleida');
  const [annulItems, setAnnulItems] = useState([
    { item: 1, codigo: 'SRV-01', descripcion: 'Masaje Relajante Aleida', cantidad: 1, precio: 280.0, subtotal: 280.0 }
  ]);
  const [annulLoading, setAnnulLoading] = useState(false);
  const [alertaPinInvalido, setAlertaPinInvalido] = useState('');
  const [mensajePaso13, setMensajePaso13] = useState('');
  const [busquedaError, setBusquedaError] = useState('');
  const [annulHistory, setAnnulHistory] = useState([
    { fecha: '2026-10-06 10:15', boleta: 'B001-0004810', nota_credito: 'NC-012', nc: 'NC-012', monto: 120.0, cliente: 'Rosa Quispe', servicio: 'Manicure Spa', motivo: 'Devolución por insatisfacción', autorizado_por: 'Aleida Flores (Gerente General)' }
  ]);

  // Lista unificada de boletas emitidas disponibles para anular
  const boletasDisponibles = [
    ...(ventas || []).map(v => ({
      numero_boleta: v.numero_boleta,
      cliente: v.cliente,
      servicio: v.servicio,
      monto: v.total,
      medio_pago: v.medio_pago,
      fecha: v.fecha,
      estado: v.estado
    })),
    ...(salesHistory || []).map(s => ({
      numero_boleta: s.numero_boleta,
      cliente: s.cliente,
      servicio: s.servicio,
      monto: s.total,
      medio_pago: s.medio_pago,
      fecha: s.fecha,
      estado: 'Emitida'
    })),
    {
      numero_boleta: 'B001-0004820',
      cliente: 'Mariana Torres',
      servicio: 'Masaje Relajante Aleida',
      monto: 280.0,
      medio_pago: 'Efectivo',
      fecha: '09:45 AM',
      estado: 'Emitida'
    },
    {
      numero_boleta: 'B001-0004821',
      cliente: 'Patricia Valdivia',
      servicio: 'Facial Rejuvenecedor con Oro',
      monto: 450.0,
      medio_pago: 'Yape/Plin',
      fecha: '11:30 AM',
      estado: 'Emitida'
    }
  ];

  // Filtrado reactivo de clientes para el padrón
  const filteredClientes = clientes.filter(cl => {
    if (!clientSearchQuery) return true;
    const q = clientSearchQuery.toLowerCase().trim();
    return (
      (cl.dni && cl.dni.toLowerCase().includes(q)) ||
      (cl.nombre && cl.nombre.toLowerCase().includes(q)) ||
      (cl.telefono && cl.telefono.toLowerCase().includes(q)) ||
      (cl.preferencias && cl.preferencias.toLowerCase().includes(q))
    );
  });

  // Calculations for POS
  const basePrice = parseFloat(posAmount) || 0;
  const extraPrice = parseFloat(posExtraProduct) || 0;
  const subtotalBeforeDiscount = basePrice + extraPrice;
  const discountAmount = posDiscount === '10' ? subtotalBeforeDiscount * 0.10 : 0;
  const totalFacturado = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const subtotalSinIGV = totalFacturado / 1.18;
  const igvAmount = totalFacturado - subtotalSinIGV;
  const vueltoCalculado = Math.max(0, (parseFloat(cashGiven) || 0) - totalFacturado);

  // Paso 1: Seleccionar cita con servicio finalizado en cabina (estado Atendida)
  const handleChargeFromAgenda = async (cita) => {
    setAlertaInsuficiente(null);
    setSelectedCitaId(cita.id);
    setPosClient(cita.cliente);
    setPosService(cita.servicio);
    setPosAmount(cita.monto.toString());
    setCashGiven(cita.monto.toString());
    setActiveTab('caja');

    try {
      const liq = await api.liquidarCita(cita.id);
      if (liq && liq.success) {
        showToast(`Desglose liquidado — Subtotal: S/ ${liq.subtotal.toFixed(2)}, IGV: S/ ${liq.igv.toFixed(2)}, Total: S/ ${liq.total.toFixed(2)}.`);
      }
    } catch (_) {}
    showToast(`Cita de ${cita.cliente} (Atendida) cargada en terminal POS.`);
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setAlertaInsuficiente(null);

    const cajaEstaAbierta = (caja?.estado === 'Abierta') || (caja?.estadosesion === 'Abierta') || cajaAbierta;
    if (!cajaEstaAbierta) {
      const errorMsg = 'Validación fallida — La caja de turno no se encuentra abierta. Debe ingresar al módulo de Caja y aperturar el turno antes de procesar cobros.';
      setAlertaInsuficiente(errorMsg);
      showToast(`⚠️ ${errorMsg}`);
      return;
    }

    if (totalFacturado <= 0) {
      setAlertaInsuficiente('El importe total a cobrar debe ser mayor a S/ 0.00.');
      return;
    }

    let montoIngresado = totalFacturado;
    if (posPaymentMethod === 'Efectivo') {
      montoIngresado = parseFloat(cashGiven) || 0;
      if (montoIngresado < totalFacturado) {
        const faltante = (totalFacturado - montoIngresado).toFixed(2);
        const errorMsg = `Saldo insuficiente — El monto entregado en efectivo (S/ ${montoIngresado.toFixed(2)}) es menor al total a pagar de S/ ${totalFacturado.toFixed(2)} (Faltan S/ ${faltante}).`;
        setAlertaInsuficiente(errorMsg);
        showToast(`⚠️ ${errorMsg}`);
        return;
      }
    }

    let formaPagoTexto = posPaymentMethod;
    if (posPaymentMethod === 'Yape/Plin') {
      formaPagoTexto = `${digitalWalletType === 'yape' ? 'Yape' : 'Plin'} (Op: ${walletOpCode || '849201'})`;
    } else if (posPaymentMethod === 'Tarjeta POS') {
      const last4 = (cardNumber || '').replace(/\D/g, '').slice(-4) || '7890';
      formaPagoTexto = `Tarjeta ${cardType} ${cardBrand} ****${last4} (${cardInstallments} cuota${cardInstallments !== '1' ? 's' : ''})`;
    }

    setCargandoCobro(true);
    try {
      // Paso 8, 9, 10: Enviar a :VentaService para registrar venta y actualizar cita en BD
      const res = await onProcessPayment({
        cita_id: selectedCitaId,
        cliente: posClient,
        servicio: extraPrice > 0 ? `${posService} + Insumo de Reventa` : posService,
        monto: totalFacturado,
        monto_ingresado: montoIngresado,
        medio_pago: formaPagoTexto,
        descuento: discountAmount
      });

      if (res && res.success === false) {
        // Paso 13 & 14: Mostrar alerta de saldo insuficiente en pantalla
        const errorMsg = res.alerta || res.error || res.mensaje || 'Error al procesar el cobro.';
        setAlertaInsuficiente(errorMsg);
        showToast(`⚠️ ${errorMsg}`);
        return;
      }

      // Paso 11: Notificar venta procesada con éxito
      const numBoleta = res?.boleta?.numero_boleta || res?.venta?.numero_boleta || `B001-${salesHistory.length + 4822}`;
      const boletaCompleta = {
        numero_boleta: numBoleta,
        serie: 'B001',
        fecha: new Date().toLocaleString('es-PE'),
        cliente: posClient,
        servicio: extraPrice > 0 ? `${posService} + Insumo de Reventa` : posService,
        subtotal: subtotalSinIGV,
        igv: igvAmount,
        total: totalFacturado,
        medio_pago: formaPagoTexto,
        monto_ingresado: montoIngresado,
        vuelto: Math.max(0, montoIngresado - totalFacturado)
      };

      setSalesHistory(prev => [boletaCompleta, ...prev]);

      setReceiptData(boletaCompleta);
      setReceiptType('boleta');
      setIsReceiptOpen(true);

      showToast(res?.message || `Venta procesada con éxito. Boleta ${numBoleta} emitida.`);
      setSelectedCitaId(null);
    } catch (err) {
      setAlertaInsuficiente('Error de red al registrar la venta y emisión de boleta en la base de datos.');
    } finally {
      setCargandoCobro(false);
    }
  };

  // =========================================================================
  // ANULAR VENTA CON NOTA DE CRÉDITO
  // =========================================================================
  const handleBuscarComprobante = async (ticketNum) => {
    const num = (ticketNum || annulTicket || '').trim();
    if (!num) {
      setBusquedaError('Ingrese o seleccione un número de comprobante para buscar.');
      return;
    }
    setBusquedaError('');
    setAlertaPinInvalido('');
    setMensajePaso13('');
    setAnnulLoading(true);
    try {
      const res = await api.getDetalleComprobante(num);
      if (res && res.success && res.comprobante) {
        const c = res.comprobante;
        setAnnulTicket(c.numero_boleta || num);
        setAnnulCliente(c.cliente || 'Cliente General');
        setAnnulMonto((c.total || 0).toFixed(2));
        setAnnulMedio(c.medio_pago || 'Efectivo');
        setAnnulServicio(c.items?.[0]?.descripcion || 'Servicio Spa');
        setAnnulItems(c.items && c.items.length > 0 ? c.items : [
          { item: 1, codigo: 'SRV-01', descripcion: c.items?.[0]?.descripcion || 'Servicio Spa', cantidad: 1, precio: c.total, subtotal: c.total }
        ]);
        showToast(`Comprobante ${num} obtenido. Total a devolver: S/ ${(c.total || 0).toFixed(2)}.`);
      } else {
        const encontrada = boletasDisponibles.find(b => b.numero_boleta?.toLowerCase() === num.toLowerCase());
        if (encontrada) {
          setAnnulTicket(encontrada.numero_boleta);
          setAnnulCliente(encontrada.cliente || 'Cliente General');
          setAnnulMonto(parseFloat(encontrada.monto || 0).toFixed(2));
          setAnnulMedio(encontrada.medio_pago || 'Efectivo');
          setAnnulServicio(encontrada.servicio || 'Servicio Spa');
          setAnnulItems([
            { item: 1, codigo: 'SRV-01', descripcion: encontrada.servicio || 'Servicio Spa', cantidad: 1, precio: parseFloat(encontrada.monto || 0), subtotal: parseFloat(encontrada.monto || 0) }
          ]);
          showToast(`Comprobante ${num} cargado desde el registro de caja.`);
        } else {
          setBusquedaError(`Comprobante "${num}" no encontrado en el sistema.`);
          showToast(`No se encontró el comprobante ${num}.`);
        }
      }
    } catch (err) {
      setBusquedaError('Error de red al consultar detalle de comprobante.');
    } finally {
      setAnnulLoading(false);
    }
  };

  const handleExecuteAnnulment = async (e) => {
    e.preventDefault();
    setAlertaPinInvalido('');
    setMensajePaso13('');

    const montoNum = parseFloat(annulMonto) || 0;
    if (montoNum <= 0) {
      showToast('El monto a anular debe ser mayor a S/ 0.00.');
      return;
    }

    const payload = {
      boleta: annulTicket,
      pin: annulPin,
      motivo: annulMotivo,
      monto: montoNum,
      cliente: annulCliente,
      medio_pago: annulMedio,
      servicio: annulServicio,
      autorizado_por: currentUser?.nombre ? `${currentUser.nombre} (${currentUser.rol})` : 'Aleida Flores (Gerente General)'
    };

    setAnnulLoading(true);
    try {
      const res = await onProcessAnnulment(payload);

      if (res && res.success === false) {
        if (res.paso === 14 || res.alerta || res.error?.includes('PIN') || res.error?.includes('14')) {
          setAlertaPinInvalido(res.error || 'PIN de gerencia incorrecto (requiere PIN 1234).');
        } else {
          showToast(`⚠️ ${res.error || 'Error al procesar la anulación'}`);
        }
        return;
      }

      const ncNumero = res?.anulacion?.nota_credito || `NC-0${(anulaciones?.length || 0) + annulHistory.length + 13}`;

      const now = new Date();
      const todayDateStr = now.toISOString().slice(0, 10);
      const nowTimeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      const fullFechaStr = `${todayDateStr} ${nowTimeStr}`;

      const newNC = {
        fecha: fullFechaStr,
        boleta: annulTicket,
        nota_credito: ncNumero,
        nc: ncNumero,
        monto: montoNum,
        cliente: annulCliente,
        servicio: annulServicio || 'Tratamiento revertido por auditoría',
        motivo: annulMotivo,
        medio_pago: annulMedio,
        autorizado_por: payload.autorizado_por
      };

      setAnnulHistory(prev => [newNC, ...prev]);
      setReceiptData(newNC);
      setReceiptType('nota_credito');
      setIsReceiptOpen(true);

      setMensajePaso13(`Devolver dinero en ${annulMedio} (S/ ${montoNum.toFixed(2)}) al cliente ${annulCliente} y registrar constancia física.`);
      showToast(res?.message || `Anulación exitosa. Se emitió ${ncNumero} y se reversó S/ ${montoNum.toFixed(2)} en PostgreSQL.`);
    } catch (err) {
      showToast('Error inesperado al conectar con el servidor.');
    } finally {
      setAnnulLoading(false);
    }
  };

  const handleOpenClientFile = (cliente) => {
    setSelectedClient(cliente);
    setIsClientFileOpen(true);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar — 10 Casos de Uso del Sistema */}
      {/* Sidebar — Dinámico con Control de Acceso por Roles (RBAC) */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">SPA</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'block' }}>Salon Spa Aleida</span>
            <span style={{ fontSize: '0.70rem', color: '#D4AF37', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              Área de Recepción
            </span>
          </div>
        </div>

        {/* Menú de Navegación según Rol */}
        <nav className="sidebar-menu">
          {roleConfig.sections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.tabs.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span><TabIcon size={16} /></span>
                    {tab.label}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Switcher de Roles para Evaluación / Pruebas (Restringido exclusivamente a Administrador) */}
        {onChangeRole && (currentUser?.originalRol?.toLowerCase().includes('admin') || (!currentUser?.originalRol && userRoleKey === 'Administrador')) && (
          <div className="sidebar-role-switcher">
            <span className="role-switcher-title">Vista de Evaluación (Solo Admin):</span>
            <div className="role-switcher-grid">
              <button 
                type="button"
                id="role-switch-admin"
                className={`btn-role-chip ${userRoleKey === 'Administrador' ? 'active' : ''}`}
                onClick={() => onChangeRole('Administrador')}
                title="Perfil Administrador"
              >
                Admin
              </button>
              <button 
                type="button"
                id="role-switch-recepcion"
                className={`btn-role-chip ${userRoleKey === 'Recepcionista' ? 'active' : ''}`}
                onClick={() => onChangeRole('Recepcionista')}
                title="Perfil Recepción"
              >
                Recepción
              </button>
              <button 
                type="button"
                id="role-switch-cajero"
                className={`btn-role-chip ${userRoleKey === 'Cajero' ? 'active' : ''}`}
                onClick={() => onChangeRole('Cajero')}
                title="Perfil Cajero"
              >
                Cajero
              </button>
            </div>
          </div>
        )}

        <div className="sidebar-user">
          <div className="user-avatar">
            {currentUser ? currentUser.nombre.split(' ').map(n=>n[0]).join('').slice(0,2) : 'US'}
          </div>
          <div className="user-info">
            <strong>{currentUser ? currentUser.nombre : 'Usuario'}</strong>
            <small>{roleConfig.badgeText}</small>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-status" style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F4F7F5', border: '1px solid #D1E7DD', padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: '#555' }}>Fecha:</span> <strong style={{ color: '#1B3D2B' }}>{caja.fecha || todayStr}</strong>
              <span style={{ color: '#CCC' }}>|</span>
              <span style={{ color: '#555' }}>Turno:</span> <strong style={{ color: '#2E7D32' }}>{caja.turno || 'Turno Mañana'}</strong>
            </div>
            <button className="btn-outline" onClick={onSwitchToPortal} style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              Portal Web
            </button>
            {onRefreshCitas && (
              <button
                className="btn-outline"
                onClick={async () => { await onRefreshCitas(); }}
                title="Recargar todas las citas desde la base de datos sin cerrar sesion"
                style={{ borderColor: '#1B6CA8', color: '#1B6CA8', fontWeight: 600, background: '#EBF5FF' }}
              >
                Sincronizar Agenda
              </button>
            )}
            <button 
              className="btn-outline" 
              onClick={onSwitchToBooking} 
              style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)', fontWeight: 600 }}
              title="Abrir la página oficial de reservas en pantalla completa"
            >
              Página Reservar Cita
            </button>
            <span className="badge-status open">
              <span className="status-dot"></span> Caja Turno: <strong>S/ {((Number(caja.apertura) || 0) + (Number(caja.efectivo) || 0) + (Number(caja.digital) || 0) - (Number(caja.egresos) || 0)).toFixed(2)}</strong>
            </span>
          </div>
        </header>

        {/* Guardia de Seguridad por Rol */}
        {!allowedTabs.includes(activeTab) && (
          <div className="role-restricted-pane">
            <div className="role-restricted-card">
              <span className="restricted-icon">
                <LockIcon size={32} color="#C8A26A" />
              </span>
              <h3>Acceso Restringido para el Rol {roleConfig.nombre}</h3>
              <p>
                Este módulo requiere privilegios que no corresponden a su perfil operativo (<strong>{roleConfig.nombre}</strong>).
                Conforme a la matriz de roles y seguridad del sistema, cada usuario solo puede acceder a las funciones asignadas a su cargo.
              </p>
              <div className="restricted-allowed-chips">
                <span>Módulos autorizados para su perfil:</span>
                <div className="chips-row">
                  {allowedTabs.map(tId => (
                    <button key={tId} className="chip-tab-redirect" onClick={() => setActiveTab(tId)}>
                      {tId.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="btn-action primary" 
                onClick={() => setActiveTab(roleConfig.defaultTab)} 
                style={{ marginTop: '16px' }}
              >
                Ir a Mi Módulo Principal ({roleConfig.defaultTab.toUpperCase()})
              </button>
            </div>
          </div>
        )}

        {/* TAB: AGENDA DE CITAS */}
        {activeTab === 'agenda' && (() => {
          const citasFiltradas = citas.filter(c => {
            if (agendaDateFilter === 'hoy') {
              const cDate = String(c.fecha || '').slice(0, 10);
              return cDate === todayStr || c.fecha === 'Hoy' || !c.fecha;
            }
            return true;
          });

          return (
            <section className="admin-tab">
              <div className="tab-header">
                <div>
                  <span className="badge-tag gold">Gestión de Citas</span>
                  <h3>Gestionar Citas &amp; Cabinas Climatizadas</h3>
                  <small style={{ color: 'var(--color-text-muted)' }}>
                    Valida disponibilidad en tiempo real, registra citas en base de datos, transiciona a 'Atendida' y libera cabina para cobro en Caja.
                  </small>
                </div>
                <button className="btn-action primary" onClick={() => { setEditingAppt(null); setIsApptModalOpen(true); }}>
                  + Gestionar Nueva Cita
                </button>
              </div>

              {/* Barra de Filtro y Organización por Día */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#F8FBF9', 
                border: '1px solid #D8E7DC', 
                borderRadius: '8px', 
                padding: '10px 16px', 
                marginBottom: '14px', 
                gap: '12px', 
                flexWrap: 'wrap' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#333' }}>Registro Diario:</span>
                  <button
                    type="button"
                    style={{
                      background: agendaDateFilter === 'hoy' ? '#1B3D2B' : '#FFF',
                      color: agendaDateFilter === 'hoy' ? '#FFF' : '#1B3D2B',
                      border: '1px solid #1B3D2B',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setAgendaDateFilter('hoy')}
                  >
                    Citas de Hoy ({todayStr})
                  </button>
                  <button
                    type="button"
                    style={{
                      background: agendaDateFilter === 'todas' ? '#1B3D2B' : '#FFF',
                      color: agendaDateFilter === 'todas' ? '#FFF' : '#1B3D2B',
                      border: '1px solid #CCD0D5',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setAgendaDateFilter('todas')}
                  >
                    Ver Todas las Fechas
                  </button>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#555' }}>
                  Mostrando <strong>{citasFiltradas.length}</strong> {agendaDateFilter === 'hoy' ? `citas de hoy (${todayStr})` : `citas registradas en el sistema`}
                </div>
              </div>

              <div className="agenda-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Horario</th>
                      <th>Cliente</th>
                      <th>Servicio Solicitado</th>
                      <th>Especialista</th>
                      <th>Estado de Cita</th>
                      <th>Monto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#718096' }}>
                          No hay citas programadas para hoy ({todayStr}). Puede agendar una nueva cita en mostrador o pulsar "Ver Todas las Fechas".
                        </td>
                      </tr>
                    ) : (
                      citasFiltradas.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.hora}</strong><br /><small>{c.fecha}</small></td>
                          <td>
                            <strong>{c.cliente}</strong><br />
                            <button 
                              className="btn-table" 
                              style={{ fontSize: '0.72rem', padding: '2px 6px', marginTop: '3px' }}
                              onClick={() => {
                                const cli = clientes.find(cl => cl.nombre.toLowerCase().includes(c.cliente.toLowerCase())) || {
                                  dni: c.dni,
                                  nombre: c.cliente,
                                  telefono: '987654321',
                                  preferencias: 'Cliente con cita agendada',
                                  visitas: 1
                                };
                                handleOpenClientFile(cli);
                              }}
                            >
                              Ver Ficha Cliente
                            </button>
                          </td>
                          <td>{c.servicio}</td>
                          <td>{c.especialista}</td>
                          <td>
                            <span className={`tag ${c.estado === 'Atendida' ? 'attended' : c.estado === 'Confirmada' ? 'confirmed' : c.estado === 'Cancelada' ? 'neg' : 'in-progress'}`}>
                              {c.estado}
                            </span>
                            {c.motivo_cancelacion && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', marginTop: '2px' }}>
                                Motivo: {c.motivo_cancelacion}
                              </div>
                            )}
                          </td>
                          <td>S/ {c.monto.toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {c.estado !== 'Atendida' && c.estado !== 'Cancelada' && (
                                <button 
                                  className="btn-table" 
                                  style={{ background: '#E8F5E9', color: '#1B5E20', borderColor: '#81C784', fontWeight: 600 }}
                                  onClick={async () => {
                                    await onChangeCitaEstado?.(c.id, 'Atendida');
                                    showToast(`Cita #${c.id} de ${c.cliente} marcada como 'Atendida'. Cabina liberada y lista para cobro en Caja.`);
                                  }}
                                  title="Registrar fin de atención en cabina y liberar cabina para cobro en POS"
                                >
                                  Marcar Atendida
                                </button>
                              )}
                              {c.cobrado ? (
                                <button 
                                  className="btn-table" 
                                  onClick={() => {
                                    setReceiptData({
                                      numero_boleta: `B001-0004820`,
                                      fecha: c.fecha || todayStr,
                                      cliente: c.cliente,
                                      servicio: c.servicio,
                                      total: c.monto,
                                      medio_pago: 'Efectivo en Caja'
                                    });
                                    setReceiptType('boleta');
                                    setIsReceiptOpen(true);
                                  }}
                                >
                                  Ver Boleta
                                </button>
                              ) : (
                                <button className="btn-table primary" onClick={() => handleChargeFromAgenda(c)}>
                                  Cobrar en POS
                                </button>
                              )}
                              <button 
                                className="btn-table" 
                                onClick={() => { setEditingAppt(c); setIsApptModalOpen(true); }}
                              >
                                Reprogramar / Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })()}

        {/* TAB DS_CU03: REGISTRAR CLIENTE */}
        {activeTab === 'clientes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Padrón de Clientes &amp; Fichas Estéticas</span>
                <h3>Padrón Centralizado de Clientes &amp; Fichas Estéticas</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Almacena historial estético, visitas acumuladas, sensibilidad dérmica y preferencias personalizadas sincronizadas con la Base de Datos.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {onRefreshClientes && (
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={onRefreshClientes} 
                    title="Sincronizar clientes desde backend PostgreSQL"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    Sincronizar Padrón
                  </button>
                )}
                <button 
                  className="btn-action primary" 
                  id="btn-abrir-registro-cliente"
                  onClick={() => setIsClientRegisterModalOpen(true)}
                >
                  + Consultar / Registrar Cliente
                </button>
              </div>
            </div>

            {/* Barra de Búsqueda Rápida y Estadísticas en Vivo */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#F8FBF9', 
              border: '1px solid #D8E7DC', 
              borderRadius: '8px', 
              padding: '10px 16px', 
              marginBottom: '14px',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Buscar:</span>
                <input 
                  type="text" 
                  value={clientSearchQuery} 
                  onChange={(e) => setClientSearchQuery(e.target.value)} 
                  placeholder="Buscar por DNI, Nombres, Teléfono o Historial dérmico..." 
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    border: '1px solid #CCD0D5', 
                    borderRadius: '6px', 
                    fontSize: '0.9rem',
                    background: '#FFF' 
                  }}
                />
                {clientSearchQuery && (
                  <button 
                    type="button" 
                    onClick={() => { setClientSearchQuery(''); setHeaderSearchQuery(''); }} 
                    style={{ background: '#E2E8F0', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#4A5568', fontWeight: 'bold' }}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.86rem', color: '#4A5568' }}>
                <span>Total Registrados: <strong style={{ color: '#1B3D2B', fontSize: '0.95rem' }}>{clientes.length}</strong></span>
                <span>Coincidencias: <strong style={{ color: '#B38B28', fontSize: '0.95rem' }}>{filteredClientes.length}</strong></span>
              </div>
            </div>

            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres y Apellidos</th>
                    <th>Teléfono</th>
                    <th>Historial Estético &amp; Dérmico</th>
                    <th>Visitas</th>
                    <th>Última Atención</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#718096' }}>
                        No se encontraron clientes que coincidan con "<strong>{clientSearchQuery}</strong>".
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map(cl => (
                      <tr key={cl.dni}>
                        <td><strong>{cl.dni}</strong></td>
                        <td><strong>{cl.nombre}</strong></td>
                        <td>{cl.telefono}</td>
                        <td style={{ maxWidth: '320px', lineHeight: 1.4 }}>{cl.preferencias}</td>
                        <td><span className="tag confirmed">{cl.visitas || 1} visitas</span></td>
                        <td>{cl.ultima_visita || 'Hoy'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-table primary" onClick={() => handleOpenClientFile(cl)}>
                              Expediente
                            </button>
                            <button 
                              className="btn-table" 
                              style={{ background: '#EBF5EE', color: '#1B3D2B', borderColor: '#4A7C59', fontWeight: 600 }}
                              onClick={() => {
                                setPosClient(cl.nombre);
                                setActiveTab('caja');
                                showToast(`Cliente "${cl.nombre}" seleccionado en Terminal POS.`);
                              }}
                              title="Cargar este cliente en la Terminal POS para facturación"
                            >
                              Cobrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB DS_CU05: REPROGRAMAR CITA */}
        {activeTab === 'reprogramar' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Modificación de Agenda</span>
                <h3>Reprogramar o Cancelar Citas del Spa</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Selección de cita en agenda → Reprogramar validando cabina y turno disponible, o Cancelar registrando motivo justificado y liberando cabina.
                </small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Horario</th><th>Cliente</th><th>Servicio Solicitado</th><th>Estado</th><th>Acciones de Control</th></tr></thead>
                <tbody>
                  {citas.filter(c => c.estado !== 'Atendida' && c.estado !== 'Cancelada').map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.hora}</strong><br/><small>{c.fecha}</small></td>
                      <td>{c.cliente}</td><td>{c.servicio}</td>
                      <td><span className={`tag ${c.estado === 'Confirmada' ? 'confirmed' : 'in-progress'}`}>{c.estado}</span></td>
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button 
                            className="btn-table" 
                            onClick={() => { setEditingAppt({ ...c, _preferredMode: 'reprogramar' }); setIsApptModalOpen(true); }}
                            title="Modificar fecha y bloque de horario (Flujo CUS05)"
                          >
                            Reprogramar
                          </button>
                          <button 
                            className="btn-table" 
                            style={{ color: 'var(--color-danger)', borderColor: '#EF5350' }} 
                            onClick={() => { setEditingAppt({ ...c, _preferredMode: 'cancelar' }); setIsApptModalOpen(true); }}
                            title="Cancelar cita con registro de motivo justificado"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB DS_CU02: REGISTRAR PERSONAL */}
        {activeTab === 'personal' && (
          <section className="admin-tab">
            <PersonalManager usuarios={usuarios} onAddPersonal={onAddPersonal} showToast={showToast} />
          </section>
        )}

        {/* TAB DS_CU06: CATALOGO DE SERVICIOS */}
        {activeTab === 'catalogo' && (
          <section className="admin-tab">
            <CatalogoManager catalogo={catalogo} onAddServicio={onAddServicio} showToast={showToast} />
          </section>
        )}

        {/* TAB DS_CU07: APERTURAR TURNO DE CAJA */}
        {activeTab === 'apertura' && (
          <section className="admin-tab">
            <AperturasCaja 
              onApertura={onAperturaCaja} 
              caja={caja}
              cajaAbierta={cajaAbierta} 
              currentUser={currentUser}
              showToast={showToast} 
              onNavigateTab={setActiveTab}
            />
          </section>
        )}

        {/* TAB 3: PUNTO DE VENTA (CUS Procesar Venta y Cobro - Diagrama BCE) */}
        {activeTab === 'caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Punto de Venta (POS) &amp; Emisión de Boleta Electrónica</h3>
              </div>
              {onRefreshCaja && (
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={onRefreshCaja}
                  title="Sincronizar balance de caja desde backend"
                >
                  Sincronizar Caja
                </button>
              )}
            </div>

            {/* Alerta de Saldo Insuficiente */}
            {alertaInsuficiente && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <strong>Alerta de Saldo Insuficiente en Pantalla</strong>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{alertaInsuficiente}</div>
                </div>
              </div>
            )}

            {/* Banner de Saldo de Caja de Turno en Vivo */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '12px', 
              background: '#F8FBF9', 
              border: '1px solid #C2E0C6', 
              borderRadius: '10px', 
              padding: '14px 18px', 
              marginBottom: '18px' 
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Fondo Apertura</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B3D2B' }}>
                  S/ {(Number(caja.apertura) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Efectivo en Mostrador</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E7D32' }}>
                  S/ {(Number(caja.efectivo) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Digital (Yape / POS)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0277BD' }}>
                  S/ {(Number(caja.digital) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Total Teórico en Caja</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B38B28' }}>
                  S/ {((Number(caja.apertura) || 0) + (Number(caja.efectivo) || 0) + (Number(caja.digital) || 0) - (Number(caja.egresos) || 0)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Selector de Citas Finalizadas en Cabina (estado Atendida) */}
            {(() => {
              const citasAtendidas = citas.filter(c => c.estado === 'Atendida' && !c.cobrado);
              const pendingOther = citas.filter(c => !c.cobrado && c.estado !== 'Cancelada' && c.estado !== 'Atendida');

              return (
                <div style={{ 
                  background: '#FFFDE7', 
                  border: '1px solid #FFE082', 
                  borderRadius: '8px', 
                  padding: '12px 16px', 
                  marginBottom: '18px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#795548' }}>
                      Seleccionar Cita con Servicio Finalizado en Cabina (estado: Atendida) [{citasAtendidas.length} listas]:
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#8D6E63' }}>Fecha operativa: {caja.fecha || todayStr}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: pendingOther.length > 0 ? '8px' : '0' }}>
                    {citasAtendidas.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        style={{ 
                          background: selectedCitaId === c.id ? '#1B3D2B' : '#FFF', 
                          border: '2px solid #2E7D32', 
                          color: selectedCitaId === c.id ? '#FFF' : '#1B3D2B', 
                          padding: '6px 14px', 
                          fontSize: '0.82rem', 
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          fontWeight: selectedCitaId === c.id ? 700 : 500
                        }}
                        onClick={() => handleChargeFromAgenda(c)}
                        title={`Clic para liquidar y cobrar la atención culminada de ${c.cliente}`}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedCitaId === c.id ? '#4CAF50' : '#2E7D32', display: 'inline-block' }}></span>
                        <strong>{c.hora}</strong> · {c.cliente} ({c.servicio} - <strong>S/ {c.monto}</strong>) [Atendida]
                      </button>
                    ))}
                    {citasAtendidas.length === 0 && (
                      <span style={{ fontSize: '0.82rem', color: '#666', fontStyle: 'italic' }}>
                        No hay citas en estado 'Atendida' pendientes de cobro en este momento. Puede seleccionar una cita de la agenda o registrar un servicio directo.
                      </span>
                    )}
                  </div>

                  {pendingOther.length > 0 && (
                    <div style={{ borderTop: '1px dashed #FFE082', paddingTop: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#8D6E63', fontWeight: 600 }}>Otras Citas Agendadas ({pendingOther.length}): </span>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {pendingOther.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            style={{ background: '#FFF9C4', border: '1px solid #FBC02D', color: '#5D4037', padding: '3px 8px', fontSize: '0.76rem', cursor: 'pointer', borderRadius: '4px' }}
                            onClick={() => handleChargeFromAgenda(c)}
                          >
                            {c.fecha} {c.hora}: {c.cliente} (S/ {c.monto} - {c.estado})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Terminal de Facturación Inmediata</h3>
                <form onSubmit={handleExecutePayment}>
                  <div className="form-group">
                    <label>Cliente Titular (Escriba o elija del Padrón)</label>
                    <input 
                      type="text" 
                      value={posClient} 
                      onChange={(e) => setPosClient(e.target.value)} 
                      list="pos-clientes-list"
                      placeholder="Escriba o seleccione cliente..."
                      required 
                    />
                    <datalist id="pos-clientes-list">
                      {clientes.map((cl, idx) => (
                        <option key={cl.dni || idx} value={cl.nombre}>
                          DNI: {cl.dni} · Tel: {cl.telefono} · {cl.preferencias ? cl.preferencias.slice(0, 30) : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Tratamiento Principal</label>
                    <input 
                      type="text" 
                      value={posService} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setPosService(val);
                        const match = catalogo.find(cat => cat.nombre.toLowerCase() === val.toLowerCase());
                        if (match) setPosAmount(match.precio.toString());
                      }} 
                      list="pos-servicios-list"
                      placeholder="Escriba o seleccione tratamiento..."
                      required 
                    />
                    <datalist id="pos-servicios-list">
                      {catalogo.map(cat => (
                        <option key={cat.id} value={cat.nombre}>
                          S/ {cat.precio} ({cat.duracion} min) · {cat.categoria}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Precio del Servicio (S/)</label>
                      <input type="number" step="0.01" value={posAmount} onChange={(e) => setPosAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Producto Adicional de Salón</label>
                      <select value={posExtraProduct} onChange={(e) => setPosExtraProduct(e.target.value)}>
                        <option value="0">Ninguno (Solo servicio)</option>
                        <option value="45">Serum Reparador Capilar (+S/ 45.00)</option>
                        <option value="70">Ampolla Antiedad de Colágeno (+S/ 70.00)</option>
                        <option value="60">Aceite de Argán Puro 250ml (+S/ 60.00)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Descuento Promocional</label>
                      <select value={posDiscount} onChange={(e) => setPosDiscount(e.target.value)}>
                        <option value="0">Sin Descuento (0%)</option>
                        <option value="10">Cliente Frecuente (10% Desc.)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Medio de Pago</label>
                      <select value={posPaymentMethod} onChange={(e) => setPosPaymentMethod(e.target.value)}>
                        <option value="Yape/Plin">Billetera Digital (Yape / Plin)</option>
                        <option value="Tarjeta POS">Tarjeta Crédito / Débito POS</option>
                        <option value="Efectivo">Efectivo en Mostrador</option>
                      </select>
                    </div>
                  </div>

                  {/* SECCIÓN REACTIVA 1: BILLETERA DIGITAL (YAPE / PLIN) CON QR INVENTADO */}
                  {posPaymentMethod === 'Yape/Plin' && (
                    <DigitalWalletQR
                      walletType={digitalWalletType}
                      onWalletTypeChange={(wt) => {
                        setDigitalWalletType(wt);
                        setWalletVerified(false);
                      }}
                      amount={totalFacturado}
                      phone="987 654 321"
                      opCode={walletOpCode}
                      onOpCodeChange={setWalletOpCode}
                      isVerified={walletVerified}
                      onVerify={() => {
                        const randomOp = Math.floor(100000 + Math.random() * 900000).toString();
                        setWalletOpCode(randomOp);
                        setWalletVerified(true);
                        showToast(`Transferencia de S/ ${totalFacturado.toFixed(2)} verificada en ${digitalWalletType === 'yape' ? 'Yape' : 'Plin'} (Op: ${randomOp})`);
                      }}
                    />
                  )}

                  {/* SECCIÓN REACTIVA 2: FORMULARIO EXTRA PARA TARJETA DE CRÉDITO O DÉBITO */}
                  {posPaymentMethod === 'Tarjeta POS' && (
                    <CardPaymentForm
                      cardNumber={cardNumber}
                      onCardNumberChange={setCardNumber}
                      cardHolder={cardHolder}
                      onCardHolderChange={setCardHolder}
                      cardExp={cardExp}
                      onCardExpChange={setCardExp}
                      cardCvv={cardCvv}
                      onCardCvvChange={setCardCvv}
                      cardType={cardType}
                      onCardTypeChange={setCardType}
                      cardBrand={cardBrand}
                      onCardBrandChange={setCardBrand}
                      cardInstallments={cardInstallments}
                      onCardInstallmentsChange={setCardInstallments}
                      cardPosRef={cardPosRef}
                      amount={totalFacturado}
                    />
                  )}

                  {/* SECCIÓN REACTIVA 3: EFECTIVO EN MOSTRADOR */}
                  {posPaymentMethod === 'Efectivo' && (
                    <div className="form-row" style={{ background: '#FFFDE7', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                      <div className="form-group">
                        <label>Efectivo Recibido del Cliente (S/):</label>
                        <input type="number" step="0.01" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Vuelto a Entregar:</label>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--color-success)', display: 'block', paddingTop: '8px' }}>
                          S/ {vueltoCalculado.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-pos-pay" 
                    id="btn-cobrar-boleta"
                    disabled={cargandoCobro}
                  >
                    {cargandoCobro ? 'Procesando Venta y Boleta...' : 'Cobrar y Emitir Boleta'}
                  </button>
                </form>
              </div>

              <div className="pos-register">
                <h3>Desglose de Liquidación Fiscal</h3>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Base Servicios:</span>
                    <strong>S/ {basePrice.toFixed(2)}</strong>
                  </div>
                  {extraPrice > 0 && (
                    <div className="reg-row">
                      <span>Producto Adicional:</span>
                      <strong>+ S/ {extraPrice.toFixed(2)}</strong>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="reg-row">
                      <span>Descuento Aplicado (10%):</span>
                      <strong className="neg">- S/ {discountAmount.toFixed(2)}</strong>
                    </div>
                  )}
                  <hr />
                  <div className="reg-row">
                    <span>Subtotal Grabado (Sin IGV):</span>
                    <strong>S/ {subtotalSinIGV.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>I.G.V. (18% SUNAT):</span>
                    <strong>S/ {igvAmount.toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Importe Total a Pagar:</span>
                    <strong className="pos">S/ {totalFacturado.toFixed(2)}</strong>
                  </div>
                </div>

                {posPaymentMethod === 'Yape/Plin' && (
                  <div style={{ textAlign: 'center', marginTop: '16px', background: digitalWalletType === 'yape' ? '#FAF4FB' : '#EBF8FA', border: `1px solid ${digitalWalletType === 'yape' ? '#742284' : '#00A3C4'}`, padding: '12px', borderRadius: '8px' }}>
                    <strong style={{ color: digitalWalletType === 'yape' ? '#742284' : '#00A3C4' }}>
                      Código QR {digitalWalletType.toUpperCase()} Generado
                    </strong><br />
                    <small style={{ color: '#475569' }}>
                      Cliente escanea en mostrador para transferir S/ {totalFacturado.toFixed(2)}.
                    </small>
                  </div>
                )}

                {posPaymentMethod === 'Tarjeta POS' && (
                  <div style={{ textAlign: 'center', marginTop: '16px', background: '#F8FAFC', border: '1px solid #94A3B8', padding: '12px', borderRadius: '8px' }}>
                    <strong style={{ color: '#1E293B' }}>
                      Terminal POS Listo para Transacción
                    </strong><br />
                    <small style={{ color: '#475569' }}>
                      Tarjeta {cardType} {cardBrand} conectada vía lector chip/contactless (Ref: {cardPosRef}).
                    </small>
                  </div>
                )}

                {/* Historial de Comprobantes Emitidos en la Sesión */}
                {salesHistory.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                    <h4 style={{ fontSize: '0.88rem', color: '#1B3D2B', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Comprobantes Emitidos en Turno</span>
                      <span style={{ color: '#666' }}>{salesHistory.length} emitidos</span>
                    </h4>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', fontSize: '0.8rem' }}>
                      {salesHistory.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #EEE' }}>
                          <div>
                            <strong>{s.numero_boleta}</strong> · {s.cliente}<br />
                            <small style={{ color: '#666' }}>{s.servicio}</small>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>S/ {s.total.toFixed(2)}</span><br />
                            <small style={{ color: '#4A5568' }}>{s.medio_pago}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ANULACIONES */}
        {activeTab === 'anulaciones' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Notas de Crédito</span>
                <h3>Gestión de Anulaciones &amp; Emisión de Notas de Crédito</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Requiere selección de boleta válida, motivo obligatorio, validación estricta de PIN gerencial (1234) y reversión automática en PostgreSQL.
                </small>
              </div>
              {onRefreshAnulaciones && (
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={onRefreshAnulaciones}
                  title="Refrescar notas de crédito desde la base de datos"
                >
                  Sincronizar NC
                </button>
              )}
            </div>

            <div className="pos-layout">
              <div className="pos-checkout">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}>Emisión de Nota de Crédito</h3>
                  <span className="badge-tag" style={{ background: '#FBE9E7', color: '#D32F2F', fontWeight: 600 }}>Nota de Crédito Oficial</span>
                </div>

                <div style={{ background: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', color: '#1B3D2B' }}>
                    Buscar comprobante por número correlativo:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      id="input-buscar-boleta"
                      value={annulTicket} 
                      onChange={(e) => setAnnulTicket(e.target.value)} 
                      placeholder="Ej. B001-0004820"
                      style={{ flex: 1, padding: '8px 12px', fontWeight: 600 }}
                    />
                    <button 
                      type="button" 
                      id="btn-buscar-comprobante"
                      className="btn-action primary"
                      disabled={annulLoading}
                      onClick={() => handleBuscarComprobante(annulTicket)}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {annulLoading ? 'Buscando...' : 'Buscar Comprobante'}
                    </button>
                  </div>

                  {/* Selector Rápido de Boletas Emitidas */}
                  <label style={{ fontSize: '0.78rem', color: '#666', display: 'block', marginBottom: '4px' }}>
                    O seleccionar directamente de ventas recientes:
                  </label>
                  <select 
                    value={annulTicket} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnnulTicket(val);
                      if (val) handleBuscarComprobante(val);
                    }}
                    style={{ width: '100%', fontWeight: 500, color: '#1B3D2B', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Seleccione una boleta de la lista --</option>
                    {boletasDisponibles.map((b, idx) => (
                      <option key={idx} value={b.numero_boleta}>
                        {b.numero_boleta} · {b.cliente} · S/ {parseFloat(b.monto || 0).toFixed(2)} ({b.medio_pago}) - {b.estado || 'Emitida'}
                      </option>
                    ))}
                  </select>

                  {busquedaError && (
                    <div style={{ color: '#D32F2F', fontSize: '0.8rem', marginTop: '6px', fontWeight: 600 }}>
                      ⚠️ {busquedaError}
                    </div>
                  )}
                </div>

                {/* Mostrar detalle de ítems y monto a devolver */}
                <div style={{ background: '#FFFDE7', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#795548', fontSize: '0.88rem' }}>
                      Detalle de ítems y monto a devolver ({annulTicket || 'Sin comprobante'})
                    </strong>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1B3D2B' }}>
                      Cliente: {annulCliente}
                    </span>
                  </div>

                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '8px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E0E0E0', textAlign: 'left', color: '#555' }}>
                        <th style={{ padding: '4px 6px' }}>#</th>
                        <th style={{ padding: '4px 6px' }}>Descripción del Ítem</th>
                        <th style={{ padding: '4px 6px', textAlign: 'center' }}>Cant.</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right' }}>P. Unit</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annulItems.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px dashed #EEE' }}>
                          <td style={{ padding: '4px 6px' }}>{it.item || idx + 1}</td>
                          <td style={{ padding: '4px 6px' }}><strong>{it.descripcion}</strong></td>
                          <td style={{ padding: '4px 6px', textAlign: 'center' }}>{it.cantidad || 1}</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right' }}>S/ {parseFloat(it.precio || 0).toFixed(2)}</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600 }}>S/ {parseFloat(it.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #FFE082' }}>
                    <span style={{ fontSize: '0.82rem', color: '#5D4037' }}>
                      Medio Cobrado: <strong>{annulMedio}</strong>
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#C62828' }}>
                      Monto a Devolver: S/ {parseFloat(annulMonto || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleExecuteAnnulment}>
                  {/* Paso 7: Ingresar motivo de anulación y PIN de autorización (:Administrador -> :FormAnulacion) */}
                  <div className="form-group">
                    <label>7: Motivo Obligatorio de Anulación *</label>
                    <select value={annulMotivo} onChange={(e) => setAnnulMotivo(e.target.value)}>
                      <option value="Error en digitación de importe">Error en digitación de importe</option>
                      <option value="Devolución por insatisfacción con tratamiento">Devolución por insatisfacción con tratamiento</option>
                      <option value="Comprobante duplicado por error de sistema">Comprobante duplicado por error de sistema</option>
                      <option value="Reacción dérmica / Contraindicación médica">Reacción dérmica / Contraindicación médica</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        7: PIN de Autorización Gerencial * 
                        <span style={{ color: '#B38B28', fontWeight: 600, marginLeft: '6px' }}>(PIN Demo: 1234)</span>
                      </label>
                      <input 
                        type="password" 
                        value={annulPin} 
                        onChange={(e) => setAnnulPin(e.target.value)} 
                        placeholder="Ingrese PIN de 4 dígitos" 
                        required 
                        style={{ fontSize: '1.05rem', letterSpacing: '2px', fontWeight: 700 }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Medio de Devolución Contable</label>
                      <select value={annulMedio} onChange={(e) => setAnnulMedio(e.target.value)}>
                        <option value="Efectivo">Efectivo en Mostrador</option>
                        <option value="Yape/Plin">Billetera Digital (Yape / Plin)</option>
                        <option value="Tarjeta POS">Tarjeta Crédito / Débito POS</option>
                      </select>
                    </div>
                  </div>

                  {/* Paso 14 & 15: Alerta si el PIN es incorrecto */}
                  {alertaPinInvalido && (
                    <div className="alert-box error" style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                      <strong>⚠️ {alertaPinInvalido}</strong>
                    </div>
                  )}

                  {/* Paso 13: Devolver dinero al cliente y registrar constancia física */}
                  {mensajePaso13 && (
                    <div className="alert-box success" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                      <strong>✅ {mensajePaso13}</strong>
                    </div>
                  )}

                  {/* Resumen contable de la reversión */}
                  <div style={{ background: '#F1F8E9', border: '1px solid #C5E1A5', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#33691E' }}>
                    <strong>Reversión Contable Automática:</strong> Se cambiará el estado de la boleta a <code>Anulada</code>, se registrará la Nota de Crédito en SUNAT y se deducirá <strong>S/ {parseFloat(annulMonto || 0).toFixed(2)}</strong> del balance de <strong>{annulMedio}</strong> en PostgreSQL.
                  </div>

                  {/* Validar PIN de gerencia y registrar motivo */}
                  <button 
                    type="submit" 
                    id="btn-autorizar-anulacion"
                    className="btn-action danger" 
                    disabled={annulLoading}
                    style={{ width: '100%', padding: '14px', fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    {annulLoading ? 'Validando con Servidor...' : 'Validar PIN de Gerencia y Autorizar Anulación'}
                  </button>
                </form>
              </div>

              <div className="pos-register">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0 }}>Libro de Notas de Crédito</h3>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {((anulaciones?.length || 0) + annulHistory.length)} registros
                  </span>
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Boleta</th>
                        <th>Nota Crédito</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Anulaciones provenientes del backend de PostgreSQL */}
                      {(anulaciones || []).map((a, i) => (
                        <tr key={`db-${a.id || i}`}>
                          <td>{a.fecha ? a.fecha.slice(0, 16) : 'Hoy'}</td>
                          <td><strong>{a.boleta}</strong></td>
                          <td><span className="tag attended">{a.nota_credito}</span></td>
                          <td>{a.cliente || 'Mariana Torres'}</td>
                          <td style={{ color: '#C53030', fontWeight: 'bold' }}>- S/ {parseFloat(a.monto || 0).toFixed(2)}</td>
                          <td>
                            <button 
                              className="btn-table"
                              onClick={() => {
                                setReceiptData({
                                  ...a,
                                  servicio: 'Reversión contable por auditoría',
                                  total: a.monto
                                });
                                setReceiptType('nota_credito');
                                setIsReceiptOpen(true);
                              }}
                            >
                              Ver NC
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Anulaciones generadas en la sesión actual */}
                      {annulHistory.map((h, i) => (
                        <tr key={`local-${i}`}>
                          <td>{h.fecha}</td>
                          <td><strong>{h.boleta}</strong></td>
                          <td><span className="tag attended">{h.nc || h.nota_credito}</span></td>
                          <td>{h.cliente || 'Cliente General'}</td>
                          <td style={{ color: '#C53030', fontWeight: 'bold' }}>- S/ {parseFloat(h.monto || 0).toFixed(2)}</td>
                          <td>
                            <button 
                              className="btn-table"
                              onClick={() => {
                                setReceiptData(h);
                                setReceiptType('nota_credito');
                                setIsReceiptOpen(true);
                              }}
                            >
                              Ver NC
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: OPERACIONES DE CAJA (CUS-10: Arqueo y Cierre de Caja) */}
        {activeTab === 'operaciones-caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CUS-10 BCE Oficial</span>
                <h3>Arqueo y Cierre de Caja &amp; Emisión de Reporte Z</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Alineado estrictamente a los 14 pasos del Diagrama de Secuencia Oficial BCE: consulta de saldo teórico, desglosador físico y conciliación sin discrepancias.
                </small>
              </div>
              <span className={`badge-status ${caja.estado === 'Abierta' ? 'open' : 'closed'}`}>
                <span className="status-dot"></span> Caja {caja.turno || 'Turno Mañana'}: {caja.estado || 'Abierta'}
              </span>
            </div>
            <div className="pos-layout">
              <div className="pos-register">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0 }}>Saldo Teórico Acumulado (PostgreSQL)</h3>
                  {onRefreshCaja && (
                    <button 
                      type="button" 
                      className="btn-outline" 
                      onClick={onRefreshCaja}
                      style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                    >
                      Sincronizar Caja
                    </button>
                  )}
                </div>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Fondo de Apertura (Sencillo):</span>
                    <strong>S/ {(Number(caja.apertura) || 0).toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Cobros en Efectivo:</span>
                    <strong>S/ {(Number(caja.efectivo) || 0).toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Cobros Digitales (Yape / POS):</span>
                    <strong>S/ {(Number(caja.digital) || 0).toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Egresos Menores Justificados:</span>
                    <strong className="neg">- S/ {(Number(caja.egresos) || 0).toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Saldo Teórico en Sistema:</span>
                    <strong className="pos">S/ {((Number(caja.apertura) || 0) + (Number(caja.efectivo) || 0) + (Number(caja.digital) || 0) - (Number(caja.egresos) || 0)).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="reg-actions" style={{ flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                  {/* Solicitar fin de turno y conteo físico */}
                  <button 
                    id="btn-iniciar-arqueo"
                    className="btn-action primary" 
                    onClick={() => setIsCashAuditOpen(true)}
                    style={{ width: '100%', padding: '12px', fontWeight: 700, fontSize: '0.92rem' }}
                  >
                    Solicitar Fin de Turno y Conteo Físico
                  </button>

                  <button 
                    className="btn-outline" 
                    onClick={() => {
                      const monto = prompt('Monto del gasto menor (S/):', '25.00');
                      const motivo = prompt('Motivo justificado del egreso:', 'Compra de café y artículos de limpieza para salón');
                      if (monto) onExpense(parseFloat(monto) || 0, motivo);
                    }}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    - Registrar Egreso Menor Justificado
                  </button>
                </div>
              </div>

              <div className="pos-checkout">
                <h3>Auditoría y Control de Cuadre</h3>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', padding: '16px', borderRadius: '8px', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--color-success)' }}>Auditoría Diaria de Cuadre (Discrepancia = 0.00):</strong>
                  <p style={{ fontSize: '0.85rem', color: '#2E7D32', marginTop: '4px' }}>
                    Según la regla de negocio del diagrama de secuencia, el cierre de sesión y la emisión del Reporte Z sólo se autorizan cuando el arqueo físico coincide al 100% con el saldo teórico de PostgreSQL.
                  </p>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  <strong>Movimientos Oficiales Registrados (MovimientoCaja):</strong>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '6px', paddingRight: '4px' }}>
                    {(caja.movimientos && caja.movimientos.length > 0) ? (
                      <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.7' }}>
                        {caja.movimientos.slice(-6).reverse().map((m, i) => (
                          <li key={i}>
                            <strong>{m.hora}</strong> · <span style={{ color: m.tipo === 'Egreso' || m.tipo === 'Reversión' ? '#C53030' : '#2E7D32', fontWeight: 600 }}>[{m.tipo}]</span> {m.detalle} (S/ {Math.abs(Number(m.monto || 0)).toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.7' }}>
                        <li>Apertura con sencillo: S/ {(Number(caja.apertura) || 150).toFixed(2)}</li>
                        <li>Cobros activos en turno</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: COMPRAS & PROVEEDORES */}
        {activeTab === 'compras' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Compras &amp; Abastecimiento</span>
                <h3>Gestión de Compras, Proveedores & Kardex de Stock</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Control de insumos críticos bajo stock mínimo, emisión de Órdenes de Compra y recepción directa al inventario.
                </small>
              </div>
              <button 
                className="btn-action primary" 
                onClick={() => {
                  const proveedor = prompt('Proveedor:', "L'Oréal Professionnel Perú");
                  const insumo = prompt('Insumo a reponer:', 'Tinte Profesional 6.1 (12 tubos)');
                  if (proveedor && insumo) showToast(`[ORDEN DE COMPRA] Generada a ${proveedor} por ${insumo}.`);
                }}
              >
                + Generar Orden de Compra
              </button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Insumo / Tratamiento</th>
                    <th>Proveedor Autorizado</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado de Alerta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map(ins => (
                    <tr key={ins.id}>
                      <td><strong>{ins.nombre}</strong></td>
                      <td>{ins.proveedor}</td>
                      <td><strong>{ins.stock}</strong> unid.</td>
                      <td>{ins.stock_min} unid.</td>
                      <td>
                        {ins.alerta ? (
                          <span className="tag in-progress">Stock Crítico [ALERTA]</span>
                        ) : (
                          <span className="tag attended">Abastecido [OK]</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-table primary" 
                          onClick={() => onReceiveStock(ins.id, 6)}
                        >
                          Recepcionar +6 Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}



        {/* TAB 8: USUARIOS Y ACCESOS */}
        {activeTab === 'usuarios' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Seguridad &amp; Accesos</span>
                <h3>Administración de Usuarios, Roles & Matriz de Seguridad</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Control de privilegios por perfil de puesto: Recepcionista, Cajero, Estilista y Gerencia General.
                </small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Colaborador</th>
                    <th>Rol de Puesto</th>
                    <th>Módulos Permitidos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.usuario}>
                      <td><strong>{u.usuario}</strong></td>
                      <td>{u.nombre}</td>
                      <td><span className="tag confirmed">{u.rol}</span></td>
                      <td>{u.permisos}</td>
                      <td><span className="tag attended">Activo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 9: REPORTES GERENCIALES */}
        {activeTab === 'reportes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Inteligencia de Negocio &amp; Metas</span>
                <h3>Reportes Gerenciales & Cumplimiento de Metas SMART</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Monitoreo estadístico de los 4 objetivos estratégicos con porcentajes reales para la toma de decisiones gerenciales.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-action success" onClick={() => showToast('Exportando reporte ejecutivo en PDF...')}>
                  Descargar Reporte Ejecutivo PDF
                </button>
              </div>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">Puntualidad y Asistencia a Citas</span>
                  <strong className="kpi-val">88.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 88% (-35% inasistencias)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">Exactitud y Cuadre de Caja</span>
                  <strong className="kpi-val">98.2%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 98% (-90% descuadres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">Disponibilidad de Insumos Críticos</span>
                  <strong className="kpi-val">96.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 95% (-80% quiebres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">Fidelización y Retorno de Clientes</span>
                  <strong className="kpi-val">74.0%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 70% (+25% retorno &lt;45d)</small>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODALES DIDÁCTICOS */}
      <CashAuditModal 
        isOpen={isCashAuditOpen}
        onClose={() => {
          setIsCashAuditOpen(false);
          if (onRefreshCaja) onRefreshCaja();
        }}
        onFinalizarTurno={() => {
          setIsCashAuditOpen(false);
          if (onRefreshCaja) onRefreshCaja();
          setActiveTab('apertura');
          showToast('Turno finalizado exitosamente. Caja cerrada y lista para nueva apertura.');
        }}
        saldoTeorico={((Number(caja.apertura) || 0) + (Number(caja.efectivo) || 0) + (Number(caja.digital) || 0) - (Number(caja.egresos) || 0))}
        caja={caja}
        currentUser={currentUser}
        onConfirmCierre={async (totalFisico, dif, resp) => {
          const res = await onCloseCaja(totalFisico, dif, resp);
          if (res && res.success) {
            if (onRefreshCaja) onRefreshCaja();
          }
          return res;
        }}
      />

      <ElectronicReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        ventaData={receiptData}
        tipo={receiptType}
      />

      <ClientFileModal 
        isOpen={isClientFileOpen}
        onClose={() => setIsClientFileOpen(false)}
        cliente={selectedClient}
        onSaveClient={(updated) => {
          onSaveClient(updated);
          showToast(`Ficha clínica de ${updated.nombre} actualizada con éxito.`);
        }}
      />

      <AppointmentModal 
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        citaEditando={editingAppt}
        existingCitas={citas}
        catalogo={catalogo}
        clientes={clientes}
        onSaveCita={async (newCita) => {
          const res = await onAddCita(newCita);
          showToast(`Cita agendada para ${newCita.cliente} con ${newCita.especialista}.`);
          return res;
        }}
        onReprogramCita={async (id, nFecha, nHora) => {
          const res = await onReprogramCita(id, nFecha, nHora);
          if (res && res.success !== false) {
            showToast(`Cita #${id} actualizada en la agenda (${nFecha} a las ${nHora}) - Estado: Reprogramada`);
          }
          return res;
        }}
        onCancelCita={async (id, motivo) => {
          const res = await onCancelCita(id, motivo);
          showToast(`Cita #${id} cancelada exitosamente. Horario y cabina liberados en base de datos.`);
          return res;
        }}
      />

      {/* CUS03: Modal Registrar y Consultar Cliente */}
      <ClientRegisterModal
        isOpen={isClientRegisterModalOpen}
        onClose={() => setIsClientRegisterModalOpen(false)}
        onAddClient={onAddClient}
        onSelectForBooking={(cl) => {
          setEditingAppt({ cliente: cl.nombre, dni: cl.dni, telefono: cl.telefono, preferencias: cl.preferencias });
          setIsApptModalOpen(true);
        }}
        onSelectForPOS={(cl) => {
          setPosClient(cl.nombre);
          setActiveTab('caja');
          showToast(`Cliente "${cl.nombre}" seleccionado en Terminal POS.`);
        }}
        showToast={showToast}
        existingClientes={clientes}
      />
    </div>
  );
}

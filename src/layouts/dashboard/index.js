import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
// context and modules
import fetchAccount from '../../_fetchData/account';
import { useGlobalContext } from '../../context';
// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const { profilePk, setProfile } = useGlobalContext();

  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState({});

  useEffect(() => {
    fetchAccount(profilePk, setAccount, setProfile);
  }, []);

  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} account={account} />
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} account={account} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
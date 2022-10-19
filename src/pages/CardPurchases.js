import { filter } from 'lodash';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// material
import {
  Container,
  Card,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';

// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import CardPurchaseListHead from '../sections/@dashboard/cardPurchases/CardPurchaseListHead';
import { PayMenu } from '../sections/@dashboard/models';
import ListToolbar from '../sections/@dashboard/ListToolbar';
// mock
import fetchCardPurchases from '../_fetchData/cardPurchaseList';
import { useGlobalContext } from '../context';
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'transactionID', label: 'Transaction ID', alignRight: false },
  { id: 'status', label: 'Transaction Status', alignRight: false },
  { id: 'date', label: 'Purchased on', alignRight: false },
  { id: 'airtime', label: 'Airtime Value', alignRight: false },
  { id: 'sells', label: 'Selling Price', alignRight: false },
  { id: 'name', label: 'Agent Name', alignRight: false },
  { id: 'commision', label: 'Commission', alignRight: false },
  { id: 'payment', label: 'Agent Payment', alignRight: false },
  { id: 'isPaid', label: 'Agent Paid', alignRight: false },
  { id: '' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_transaction) => _transaction.transactionID.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function CardPurchases() {
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  const { loggedIn, profile } = useGlobalContext();
  const navigate = useNavigate();
  const prevLocation = useLocation();

  const [CARDPURCHASELIST, setCARDPURCHASELIST] = useState([]);

  const [agentSearchKey, setAgentSearchKey] = useState('');
  const [airtimeSearchKey, setAirtimeSearchKey] = useState('');
  const [isPaidSearchKey, setIsPaidSearchKey] = useState('');
  const [statusSearchKey, setStatusSearchKey] = useState('');
  const [searchURL, setSearchURL] = useState('api/remit/admin/transactions/?Status=&Airtime=&Agent=&Paid=');

  const filterProps = [
    {
      title: 'Agent Name',
      child: [...new Set(CARDPURCHASELIST.map((cardPurchase) => cardPurchase.name))],
      valueSet: agentSearchKey,
      callChangeFunc: setAgentSearchKey,
    },
    {
      title: 'Package Purchased',
      child: [...new Set(CARDPURCHASELIST.map((cardPurchase) => cardPurchase.airtime))],
      valueSet: airtimeSearchKey,
      callChangeFunc: setAirtimeSearchKey,
    },
    {
      title: 'Commission Paid',
      child: [...new Set(CARDPURCHASELIST.map((cardPurchase) => cardPurchase.paid))],
      valueSet: isPaidSearchKey,
      callChangeFunc: setIsPaidSearchKey,
    },
    {
      title: 'Payment Status',
      child: [...new Set(CARDPURCHASELIST.map((cardPurchase) => cardPurchase.status))],
      valueSet: statusSearchKey,
      callChangeFunc: setStatusSearchKey,
    },
  ];

  const handleBackendFilter = () => {
    const paymentBackendURL = `api/remit/admin/transactions/?Status=${statusSearchKey}&Airtime=${airtimeSearchKey}&Agent=${agentSearchKey}&Paid=${isPaidSearchKey}`;
    setSearchURL(paymentBackendURL);
  };

  const clearBackendFilter = () => {
    setAgentSearchKey(null);
    setAirtimeSearchKey(null);
    setIsPaidSearchKey(null);
    setStatusSearchKey(null);
    const paymentBackendURL = 'api/remit/admin/transactions/?Status=&Airtime=&Agent=&Paid=';
    setSearchURL(paymentBackendURL);
  };

  useEffect(() => {
    setLoading(true);
    if (loggedIn === false) {
      navigate(`/login?redirectTo=${prevLocation.pathname}`);
    }

    fetchCardPurchases(setLoading, setCARDPURCHASELIST, searchURL);

    console.log('Search URL: ', searchURL);
  }, [isPaid, searchURL]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('transactionID');

  const [filterTransactionID, setFilterTransactionID] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByTransactionID = (event) => {
    setFilterTransactionID(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - CARDPURCHASELIST.length) : 0;

  const filteredTransactions = applySortFilter(CARDPURCHASELIST, getComparator(order, orderBy), filterTransactionID);

  const isCardPurchaseNotFound = filteredTransactions.length === 0;

  return (
    <Page title="Dashboard: Card Purchases">
      {!loading && (
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Card Purchases
          </Typography>
          <Card>
            <ListToolbar
              filterName={filterTransactionID}
              onFilterName={handleFilterByTransactionID}
              placeHl="Transaction"
              filterProps={filterProps}
              handleBackendFilter={handleBackendFilter}
              clearBackendFilter={clearBackendFilter}
            />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800, paddingInline: '2rem', marginTop: '2rem' }}>
                <Table>
                  <CardPurchaseListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {filteredTransactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => {
                        const { transactionID, status, date, airtime, price, name, commision, payment, paid, Payment } =
                          row;
                        return (
                          <TableRow hover key={transactionID} tabIndex={-1}>
                            <TableCell component="th" scope="row" padding="normal">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography variant="subtitle2" noWrap>
                                  {transactionID}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Label variant="ghost" color={(status === 'COMMITTED' && 'warning') || 'success'}>
                                {status}
                              </Label>
                            </TableCell>
                            <TableCell align="right">{date}</TableCell>
                            <TableCell align="right">{airtime}</TableCell>
                            <TableCell align="right">{price.toFixed(2)}</TableCell>
                            <TableCell align="left">{name}</TableCell>
                            <TableCell align="right">{(commision * 100).toFixed(2)}</TableCell>
                            <TableCell align="right">{payment ? payment.toFixed(2) : Payment.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <Label variant="ghost" color={(!paid && 'error') || 'success'}>
                                {paid ? 'Yes' : 'No'}
                              </Label>
                            </TableCell>

                            {profile.is_superuser && (
                              <TableCell align="right">
                                <PayMenu
                                  payLink={`api/remit/admin/transactions/${transactionID}/`}
                                  setPaid={setIsPaid}
                                  chgable={!paid}
                                />
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>

                  {isCardPurchaseNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterTransactionID} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={CARDPURCHASELIST.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      )}
    </Page>
  );
}

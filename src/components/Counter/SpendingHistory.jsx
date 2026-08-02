import React, { useEffect, useState, useRef } from 'react'
import {useNavigate} from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthConfig';
import {Container, Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
  List, Dialog, Input, FormControl, IconButton,
  MenuItem, DialogTitle, DialogContent, DialogContentText, InputLabel, Select, TextField, DialogActions, CircularProgress,
  useTheme, Stack, Snackbar, Switch
} from '@mui/material'
import { styled } from '@mui/material/styles';
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc, increment, getDocs, query, onSnapshot, arrayUnion, GeoPoint, Timestamp, runTransaction } from "@firebase/firestore";
import { db } from '../../firebase';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs from 'dayjs';
import { tableCellClasses } from '@mui/material/TableCell';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: 'var(--color)',
  },
  [`&.${tableCellClasses.body}`]: {
    color: 'var(--color)'
  },
}));

function SpendingHistory() {
    const [historyArr, setHistoryArr] = useState([])
    const [totalAmountSpend, setTotalAmountSpend] = useState(0)
    const [page, setPage] = useState(0); // aktuelle Seite
    const [rowsPerPage, setRowsPerPage] = useState(5); // Einträge pro Seite
    const [openPAdd, setOpenPAdd] = useState(false);
    const [product, setProduct] = useState('Tabak');
    const theme = useTheme()
    const { user } = useUserAuth();


    useEffect(() => {
        getSpendingHistory()
    }, [])
    

    const getSpendingHistory = async () => {
        const historyRef = doc(db, 'Users', user.uid)
        const historyDoc = await getDoc(historyRef)
        const history = historyDoc.data().spendingHistory
        
        setHistoryArr(history)

        var sum = 0;
        history?.forEach(row => {
        sum += row.price
        })

        setTotalAmountSpend(sum)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function calculateTotalSpendAmount(price) {
        setTotalAmountSpend((Math.floor(( totalAmountSpend + price )*1000))/1000)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const price = Number(formJson.email.slice(0,5).replace(',', '.'));
        const product = formJson.product;


        const docRef = doc(db, "Users", user.uid)
        historyArr.unshift({name: product, price: price, date: Timestamp.fromDate(new Date())})


        calculateTotalSpendAmount(price)
        appendToHistory(docRef)

        async function appendToHistory(docRef) {
            await updateDoc(docRef, {
            spendingHistory: historyArr,
            })
        }

        pAddDialogClose();
    };

    const deleteEntry = (index) => {
        historyArr.splice(page * 5 + index, 1)
        //setAnus(anus + 1)

        const docRef = doc(db, "Users", user.uid)
        appendToHistory(docRef)
        async function appendToHistory(docRef) {
        await updateDoc(docRef, {
            spendingHistory: historyArr,
        })
        }

        var sum = 0;
        historyArr.forEach(row => {
        sum += row.price
        })

        setTotalAmountSpend(sum)
    }

    const handleChange = (event) => {
        setProduct(event.target.value || '');
    }

    function AddPurchase({children}) {
        return (
            <Dialog open={openPAdd} onClose={pAddDialogClose} sx={{backdropFilter: "blur(2px)", '& .MuiDialog-paper': { width: '80%', maxHeight: 435, borderRadius: '5px' }}}>
                <DialogTitle>Kauf eintragen</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    Wähle unten die Art des Produktes aus für das du den Preis eintragen möchtest. Trage anschleßend den Preis ein und drücke auf 'Eintragen'.
                    </DialogContentText>
                    <br />
                    <form noValidate onSubmit={handleSubmit} id="subscription-form">
                    <FormControl 
                        fullWidth
                        sx={{marginBottom: 3}}
                    >
                        <InputLabel id="name">Produktart</InputLabel>
                        <Select
                        labelId="name"
                        id="name"
                        value={product}
                        label="Produktart"
                        sx={{color: 'white'}}
                        onChange={handleChange}
                        name="product"
                        >
                        <MenuItem value={'Tabak'}>Tabak</MenuItem>
                        <MenuItem value={'Filter'}>Filter</MenuItem>
                        <MenuItem value={'Papes'}>Papes</MenuItem>
                        <MenuItem value={'Schachtel'}>Schachtel</MenuItem>
                        </Select>

                    </FormControl>
                    <FormControl fullWidth >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateField
                            label="Preis"
                            format="YY,YY€"
                            defaultValue={dayjs('2000-01-01')}
                            id="name"
                            name="email"
                            error={false}
                        /> 
                        </LocalizationProvider>
                    </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={pAddDialogClose}>Abbrechen</Button>
                    <Button type="submit" form="subscription-form">
                    Eintragen
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const pAddDialogOpen = () => {
        setOpenPAdd(true);
    };

    const pAddDialogClose = () => {
        setOpenPAdd(false);
    };


    return (
        <>
            <AddPurchase></AddPurchase>
            <Box height={'100vh'} display={'flex'} flexDirection={'column'} alignItems="center" justifyContent="center" >
                <Typography variant='h3' fontWeight={500}>Kaufhistorie</Typography>
                <br />
                { historyArr?.length > 0 ? 
                <TableContainer sx={{ background: theme.palette.background.gradient, border: 0, marginBottom: 10, color: 'var(--color)', boxShadow: '4px 4px 28px 8px rgba(0,0,0,0.41)'}}>
                <Table sx={{ Width: 650}} aria-label="simple table">
                    <TableHead>
                    <TableRow >
                        <StyledTableCell >Produkt</StyledTableCell>
                        <StyledTableCell align="right">Datum</StyledTableCell>
                        <StyledTableCell align="right">Preis</StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    <TableRow>
                        <TableCell key={'addRow'} align='center' colSpan={4}><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
                    </TableRow>
                        {historyArr?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                        <TableRow key={index} >
                            <StyledTableCell component="th" scope="row">
                            {row.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.date?.toDate().toLocaleDateString("de-DE")}</StyledTableCell>
                            <StyledTableCell align="right">{row.price}&nbsp;€</StyledTableCell>
                            <StyledTableCell align="right"><IconButton onClick={() => {deleteEntry(index)}} sx={{color: 'var(--color)'}}><DeleteIcon/></IconButton></StyledTableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    sx={{color: 'var(--color)'}}
                    rowsPerPageOptions={[5, 10]}
                    component="div"
                    count={historyArr.length} // alle Einträge
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Zeilen pro Seite"
                />

                <Box
                    sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 2,
                    background: "rgba(0,0,0,0.1)",
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Insgesamt Ausgeben:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {totalAmountSpend} €
                    </Typography>
                </Box>
                </TableContainer> 
                : 
                
                <TableContainer component={Paper} elevation={5} sx={{background: theme.palette.background.chartGradient, filter: 'blur(0px)', border: 0}}>
                <Table aria-label="simple table">
                    <TableBody>
                    <TableRow>
                        <TableCell align='center'><Button sx={{ border: 'none', height: '6vh', width: '100%', borderRadius: '10px', ":focus": {outline: 'none'}, background: theme.palette.background.gradient}} variant='contained' onClick={pAddDialogOpen}><AddIcon fontSize='large'/></Button></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell  sx={{borderBottom: 'none', height: 120}} align='center'>Du hast noch keine Kaufhistorie. <br /> Erstelle oben deinen ersten Eintrag!</TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
                </TableContainer> 
                }   
            </Box>
        </>
  )
}

export default SpendingHistory
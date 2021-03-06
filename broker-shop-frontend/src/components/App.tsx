import React from 'react'
import { Router, Route, RouteComponentProps } from 'react-router-dom'
import history from "../history"
import {CommonStore} from '../stores/CommonStore'
import {RouterStore} from '../stores/RouterStore'
import {CartStore} from '../stores/CartStore'
import {inject, observer} from 'mobx-react'
import {
  AppBar, Button, CircularProgress,
  Container,
  createStyles, Grid, IconButton,
  Modal, Snackbar,
  Theme,
  Toolbar,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core"
import {CSSTransition} from "react-transition-group"
import AppBarCollapse from "./common/AppBarCollapse"
import {Alert, Color} from "@material-ui/lab"
import {
  Close as CloseIcon,
  ExposurePlus1 as ExposurePlus1Icon,
  ExposureNeg1 as ExposureNeg1Icon,
  Clear as ClearIcon
}  from "@material-ui/icons"
import {UserStore} from "../stores/UserStore";

interface MatchParams {
  payment_success: string,
  payment_cancel: string
}

interface IProps {
  // здесь перечисляются все внешние параметры (свойства),
  // переданные явно из объекта родительского компонента
  startLocation: string
}

interface IInjectedProps extends IProps, WithStyles<typeof styles>, RouteComponentProps<MatchParams> {
  // здесь перечисляются все внешние параметры (свойства),
  // переданные неявно (например, внедрением зависимости при помощи дектораторов)
  commonStore: CommonStore,
  routerStore: RouterStore,
  cartStore: CartStore,
  userStore: UserStore
}

interface IState {
  snackBarVisibility: boolean,
  snackBarText: string,
  snackBarSeverity: Color
}

const styles = (theme: Theme) => createStyles({
  // объявление пользовательского класса стиля
  // (для корневого компонента разметки текущего компонента)
  root: {
    // атрибут класса стиля
    flexGrow: 1,
  },
  container: {
    maxWidth: '970px',
    '& .page' : {
      position: 'static'
    }
  },
  navBar: {
    color: '#fff',
    backgroundColor: '#ee6e73',
  },
  title: {
    flexGrow: 1,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
    cartModalContent: {
      backgroundColor: theme.palette.background.paper,
          borderhistory: '2px solid #000',
          boxShadow: theme.shadows[5],
          padding: theme.spacing(2, 4, 3),
    },
    closeButton: {
      cursor:'pointer',
          float:'right',
          marginTop: '-80px',
          marginRight: '-25px',
    }
})

@inject('commonStore', 'routerStore', 'cartStore', 'userStore')
@observer
class App extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = {
      snackBarVisibility: false,
      snackBarText: '',
      snackBarSeverity: 'success'
    }
  }

  // геттер свойства, который подводит фактически полученные props
  // под интерфейс неявно полученных props
  get injected () {
    return this.props as IInjectedProps
  }

  componentDidMount() {
    /* this.injected.commonStore.setLoading(true)
    fetch('http://localhost:8090/shop/api/categories')
        .then(response => response.json())
        .then(responseBody => console.log(responseBody))
        .catch(reason => console.log(reason))
        .finally(() => this.injected.commonStore.setLoading(false)) */
    // восстановление аутентификации пользователя на фронтенде,
    // если она была выполнена в предыдущем сеансе,
    // и пользователь не вышел после этого из учетной записи
    this.injected.userStore.check()
    // если в адресной строке присутствуют параметры -
    // настраиваем вид и текст окна уведомеления и показываем его,
    // меняя соответствующим образом значения свойств состояния компонента
    // console.log('this.injected', this.injected)
    /* if (this.injected.match) {
      console.log('this.injected.match.params', this.injected.match.params)
    } */
    /* if (this.injected.match && this.injected.match.params.payment_success) {
      this.setState({snackBarText: 'Payment successful'})
      this.setState({snackBarSeverity: 'success'})
      this.setState({snackBarVisibility: true})
    } else if (this.injected.match && this.injected.match.params.payment_cancel) {
      this.setState({snackBarText: 'Payment canceled'})
      this.setState({snackBarSeverity: 'info'})
      this.setState({snackBarVisibility: true})
    } */
    if (this.props.startLocation && this.props.startLocation.includes('payment_success')) {
      this.setState({snackBarText: 'Payment is successful'})
      this.setState({snackBarSeverity: 'success'})
      this.setState({snackBarVisibility: true})
    } else if (this.props.startLocation && this.props.startLocation.includes('payment_cancel')) {
      this.setState({snackBarText: 'Payment was canceled'})
      this.setState({snackBarSeverity: 'info'})
      this.setState({snackBarVisibility: true})
    } else if (this.props.startLocation && this.props.startLocation.includes('payment_error')) {
      this.setState({snackBarText: 'Payment error'})
      this.setState({snackBarSeverity: 'error'})
      this.setState({snackBarVisibility: true})
    }
  }

  handleErrorModalClose = (e: React.KeyboardEvent | React.MouseEvent) => {
    this.injected.commonStore.setError('')
  }

  handleCartItemPlus = (e: React.MouseEvent, productId: number) => {
    this.injected.cartStore.addToCart(productId, () => {
      this.setState({snackBarText: 'One product added to the cart'})
      this.setState({snackBarSeverity: 'success'})
      this.setState({snackBarVisibility: true})
    })
  }

  handleCartItemNeg = (e: React.MouseEvent, productId: number) => {
    this.injected.cartStore.subtractFromCart(productId, () => {
      this.setState({snackBarText: 'One product was subtracted from the cart'})
      this.setState({snackBarSeverity: 'success'})
      this.setState({snackBarVisibility: true})
    })
  }

  handleCartModalClose = (e: React.MouseEvent) => {
    this.injected.cartStore.setCartVisibility(false)
  }

  handleSnackBarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({snackBarVisibility: false})
    this.setState({snackBarSeverity: 'success'})
  }

  render () {
    const {classes, routerStore} = this.injected
    const progress = (this.injected.commonStore.loading ? <CircularProgress/> : '')
    return (
        <Router history={history}>
          <div className={classes.root}>
            {/* панель приложения, "приклееная" к верхней части страницы */}
            <AppBar position='sticky' className={classes.navBar}>
              <Toolbar>
                <Typography variant='h6' className={classes.title}>
                  SpringReact
                </Typography>
                {/* панель навигации */}
                <AppBarCollapse routes={routerStore.routes} />
              </Toolbar>
            </AppBar>
            {/* область для вывода экземпляра текущего раздела веб-приложения */}
            <Container maxWidth="sm" className={classes.container}>
              {this.injected.routerStore.routes.map(({ path, Component }) => (
                  <Route key={path} exact path={path}>
                    {({ match }) => (
                        <CSSTransition
                            in={match != null}
                            timeout={300}
                            classNames='page'
                            unmountOnExit
                        >
                          <div className='page'>
                            <Component />
                          </div>
                        </CSSTransition>
                    )}
                  </Route>
              ))}
            </Container>
            {/* Окно, которое появляется только при наличии содержательного значения
             в наблюдаемом свойстве error */}
            <Modal
                open={ !!this.injected.commonStore.error }
                onClose={ this.handleErrorModalClose }
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
              <div id='errorBlock' className={classes.modalContent}>
                {this.injected.commonStore.error}
              </div>
            </Modal>
            <Modal
                open={ this.injected.cartStore.cartShown }
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
              <div className={classes.cartModalContent}>
                <div id="simple-modal-title">
                  <h2>Shopping Cart</h2>
                  <IconButton
                      onClick={this.handleCartModalClose}
                      className={classes.closeButton}>
                    <CloseIcon/>
                  </IconButton>
                </div>
                <div id="simple-modal-description">
                  {this.injected.cartStore.cartItemsCount > 0 ? (
                      <table className="table">
                        <thead>
                        <tr>
                          <th>name</th>
                          <th>price</th>
                          <th>quantity</th>
                          <th>total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.injected.cartStore.cartItems.map(item => {
                          return (
                              <tr key={item.productId}>
                                <th scope="row">{item.name}</th>
                                <td>{item.price}</td>
                                <td>{item.quantity}</td>
                                <td>{(item.price * item.quantity).toFixed(2)}</td>
                                <td>
                                  <Grid container spacing={1}>
                                    <Grid item xs={3} >
                                      <Button
                                          onClick={(e) => {
                                            this.handleCartItemPlus(e, item.productId)
                                          }}>
                                        <ExposurePlus1Icon/>
                                      </Button>
                                    </Grid>
                                    <Grid item xs={3} >
                                      <Button
                                          onClick={(e) => {
                                            this.handleCartItemNeg(e, item.productId)
                                          }}>
                                        <ExposureNeg1Icon/>
                                      </Button>
                                    </Grid>
                                    <Grid item xs={3} >
                                      <Button
                                          onClick={(e) => {
                                            // this.handleCartItemRemove(e, item.productId)
                                          }}>
                                        <ClearIcon/>
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </td>
                              </tr>
                          )
                        })}
                        </tbody>
                      </table>
                  ) : (
                      <span>Your cart is empty</span>
                  )}
                  {/* Обычная html-гиперссылка для того, чтобы запрос на сервер
                             был выполнен синхронно, и ответ (перенаправление) ожидал не
                              код фронтенда (функция fetch), а сам браузер */}
                  <a href={`${this.injected.commonStore.basename}/cart/pay`}>Purchase</a>
                </div>
              </div>
            </Modal>
            <Snackbar
                open={this.state.snackBarVisibility}
                autoHideDuration={6000} onClose={this.handleSnackBarClose}>
              <Alert onClose={this.handleSnackBarClose} severity={this.state.snackBarSeverity}>
                {this.state.snackBarText}
              </Alert>
            </Snackbar>
            {progress}
          </div>
        </Router>
    )
  }
}

export default withStyles(styles)(App)

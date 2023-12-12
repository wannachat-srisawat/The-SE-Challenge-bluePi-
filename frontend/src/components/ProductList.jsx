import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import Swal from 'sweetalert2'
import * as Icon from 'react-bootstrap-icons';

function ProductList() {
    const [coin, setCoin] = useState(0)
    const [balance, setBalance] = useState(0)
    const [amount, setAmount] = useState(1)
    const [products, setProducts] = useState([]);
    const [show, setShow] = useState(false);
    const [showBuy, setShowBuy] = useState(false);
    const [piece, setPiece] = useState(1);
    const [id, setId] = useState(0);
    const [stock, setStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        await axios.get(`http://localhost:8000/api/products`).then(({ data }) => {
            setProducts(data);
        })
    }
    const handleClose = () => {
        setShow(false)
        setSelectedValue('')
        setCoin(0)
        setAmount(1)
    };
    const handleShow = () => {
        setShow(true);
    }
    const onChangeSelect = (e) => {
        setSelectedValue(e.target.value)
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setBalance(balance + (coin * amount))
        setShow(false)
        setSelectedValue('')
        setCoin(0)
        setAmount(1)
    };


    const handleCloseBuy = () => {
        setShowBuy(false)
        setPiece(1)
        setId(null);
        setStock(null);
        setPrice(null);
    };
    const handleShowBuy = (id, price, available) => {
        setShowBuy(true);
        setId(id);
        setStock(available);
        setPrice(price);
    }

    const handleBuySubmit = (e) => {
        e.preventDefault();
        if (balance < (price * piece)) {
            alert("you must have enough cash to buy this")
        }
        else if (stock < piece) {
            alert("our prouct is not enough for you")
        } else {
            setBalance(balance - (price * piece))
            buyProduct(id)
        }
    };
    const buyProduct = async (id) => {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('id', id);
        formData.append('available', (stock - piece));

        await axios.put(`http://localhost:8000/api/updateStock`, formData).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.message
            })
            fetchProducts()
            setPiece(1)
            setId(null);
            setStock(null);
            setPrice(null);
            setShowBuy(false)
        }).catch(({ response }) => {
            if (response.status === 422) {
                setValidationError(response.data.erros)
            } else {
                Swal.fire({
                    text: response.data.message,
                    icon: "error"
                })
            }
        })
    }

    const deleteProduct = async (id) => {
        const isConfirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            return result.isConfirmed
        })

        if (!isConfirm) {
            return;
        }

        await axios.delete(`http://localhost:8000/api/products/${id}`).then(({ data }) => {
            Swal.fire({
                icon: 'success',
                text: data.message
            })
            fetchProducts()
        }).catch(({ response: { data } }) => {
            Swal.fire({
                text: data.message,
                icon: 'error'
            })
        })
    }

    return (
        <div className='container'>
            <section id="company-services" className="padding-large">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <p class="text-info-emphasis text-end">Cash: {balance}</p>

                            <Button className='btn btn-primary mb-2 float-end' onClick={() => handleShow()}>
                                Add Coin
                            </Button>
                        </div>
                        <div className="col-12">
                            <br></br>
                        </div>
                        <div className="col-lg-3 col-md-6 pb-3">
                            <div className="icon-box d-flex">
                                <div className="icon-box-icon pe-3 pb-3">
                                    <Icon.Cart />
                                </div>
                                <div className="icon-box-content">
                                    <h3 className="card-title text-uppercase text-dark">Free delivery</h3>
                                    <p>Consectetur adipi elit lorem ipsum dolor sit amet.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 pb-3">
                            <div className="icon-box d-flex">
                                <div className="icon-box-icon pe-3 pb-3">
                                    <Icon.Box />
                                </div>
                                <div className="icon-box-content">
                                    <h3 className="card-title text-uppercase text-dark">Quality guarantee</h3>
                                    <p>Dolor sit amet orem ipsu mcons ectetur adipi elit.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 pb-3">
                            <div className="icon-box d-flex">
                                <div className="icon-box-icon pe-3 pb-3">
                                    <Icon.Tag />
                                </div>
                                <div className="icon-box-content">
                                    <h3 className="card-title text-uppercase text-dark">Daily offers</h3>
                                    <p>Amet consectetur adipi elit loreme ipsum dolor sit.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 pb-3">
                            <div className="icon-box d-flex">
                                <div className="icon-box-icon pe-3 pb-3">
                                    <Icon.Shield />
                                </div>
                                <div className="icon-box-content">
                                    <h3 className="card-title text-uppercase text-dark">100% secure payment</h3>
                                    <p>Rem Lopsum dolor sit amet, consectetur adipi elit.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <h2 className="text-muted text-center mt-4 mb-3">Our Product</h2>
            <div className="container pb-5 px-lg-5">
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-md-5">
                    {products.length > 0 ? (
                        products.map((row, key) => (
                            <div className="col">
                                {row.available > 0 ? (
                                    <div className="card shadow-sm">
                                        <img
                                            className="card-img-top bg-dark cover"
                                            height="240"
                                            alt=""
                                            src={`http://localhost:8000/storage/product/image/${row.image}`}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title text-center">{row.title}</h5>
                                            <p className="card-text text-center text-muted">{row.description}</p>
                                            <p className="card-text text-end text-danger">{row.price} THB </p>
                                            <div className="d-grid gap-2">
                                                <Button className="btn btn-outline-dark" onClick={() => handleShowBuy(row.id, row.price, row.available)}>
                                                    BUY
                                                </Button>
                                            </div>
                                            <div class="card-footer text-end text-muted">
                                                In stock : {row.available}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card shadow-sm" style={{ opacity: "0.4" }}>
                                        <img
                                            className="card-img-top bg-dark cover"
                                            height="240"
                                            alt=""
                                            src={`http://localhost:8000/storage/product/image/${row.image}`}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title text-center">{row.title}</h5>
                                            <p className="card-text text-center text-muted">{row.description}</p>
                                            <p className="card-text text-end text-danger">{row.price} THB </p>
                                            <div className="d-grid gap-2">
                                                <h5 className="text-center text-danger">OUT OF ORDER</h5>
                                            </div>
                                            <div class="card-footer text-end text-muted">
                                                In stock : {row.available}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div>
                            <div>No products found</div>
                        </div>
                    )}
                </div>
            </div>
            <Link className='btn btn-primary mb-2 float-end' to={"/product/create"}>
                Create product
            </Link>
            <div className="row">
                <div className="col-12">
                    <div className="card card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0 text-center">
                                <thead>
                                    <tr>
                                        <td>Title</td>
                                        <td>Description</td>
                                        <td>Image</td>
                                        <td>Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((row, key) => (
                                            <tr key={key}>
                                                <td>{row.title}</td>
                                                <td>{row.description}</td>
                                                <td>
                                                    <img width="50px" src={`http://localhost:8000/storage/product/image/${row.image}`} alt="" />
                                                </td>
                                                <td>
                                                    <Link to={`/product/edit/${row.id}`} className="btn btn-success me-2">
                                                        Edit
                                                    </Link>
                                                    <Button variant='danger' onClick={() => deleteProduct(row.id)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No products found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Coin or Banknotes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Check
                                value="coin"
                                type="radio"
                                label="Coin"
                                onChange={e => onChangeSelect(e)}
                                checked={selectedValue === "coin"}
                            />
                            <Form.Check
                                value="banknotes"
                                type="radio"
                                label="Banknotes"
                                onChange={e => onChangeSelect(e)}
                                checked={selectedValue === "banknotes"}
                            />
                        </Form.Group>
                        {selectedValue == "coin" ?
                            <Form.Group controlId="formBasicSelect">
                                <Form.Label>Select Price</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={coin}
                                    onChange={e => {
                                        setCoin(e.target.value);
                                    }}
                                >
                                    <option value="1">1</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                </Form.Control>
                            </Form.Group>
                            : selectedValue == "banknotes" ?
                                <Form.Group controlId="formBasicSelect">
                                    <Form.Label>Select Price</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={coin}
                                        onChange={e => {
                                            setCoin(e.target.value);
                                        }}
                                    >
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="500">500</option>
                                        <option value="1000">1000</option>
                                    </Form.Control>
                                </Form.Group>
                                : <div></div>
                        }
                        <Form.Group controlId="Amount">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control type="number" value={amount} onChange={(event) => {
                                setAmount(event.target.value)
                            }} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button type="submit">
                            Add
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showBuy} onHide={handleCloseBuy}>
                <Form onSubmit={handleBuySubmit}>
                    <Modal.Body>
                        <Form.Group controlId="Piece">
                            <Form.Label>Piece</Form.Label>
                            <Form.Control type="number" value={piece} onChange={(event) => {
                                setPiece(event.target.value)
                            }} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseBuy}>
                            Close
                        </Button>
                        <Button type="submit">
                            Buy
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    )
}

export default ProductList
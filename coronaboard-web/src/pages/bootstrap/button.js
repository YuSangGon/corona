import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Button, ButtonGroup } from "react-bootstrap";

export default function ButtonPage() {
    return (
        <Container>
            <div>
                <Button variant='primary'>Primary</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='success'>success</Button>
                <Button variant='danger'>danger</Button>
                <Button variant='warning'>warning</Button>
                <Button variant='info'>info</Button>
                <Button variant='light'>light</Button>
                <Button variant='dark'>dark</Button>
            </div>
            <hr />
            <ButtonGroup size="md">
                <Button variant="primary">오늘</Button>
                <Button variant="outline-primary">어제</Button>
            </ButtonGroup>
        </Container>
    );
}
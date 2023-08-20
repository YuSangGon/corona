import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Card, Container, Accordion, Button } from "react-bootstrap";

export default function CardAccordionPage() {
    return (
        <Container className="pt-3">
            <Accordion defaultActiveKey="0">
                <Card>
                    <Card.Header>
                        <Accordion.Toggle
                            className="p-0"
                            as={Button}
                            variant="link"
                            eventKey="0"
                        >
                            카드의 헤더
                        </Accordion.Toggle>
                    </Card.Header>

                    <Accordion.Collapse eventKey="0">
                        <Card.Body>카드 콘텐츠</Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </Container>
    );
}
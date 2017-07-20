#!/bin/bash

# this is relative to where you run the `npm` command from
mkdir -p ./certs
CERTS_DIR="./certs"
THIS_DIR="$(dirname "$0")"

openssl genrsa -des3 -out "$CERTS_DIR/rootCA.key" 2048
openssl req -x509 -new -nodes -key "$CERTS_DIR/rootCA.key" -sha256 -days 1024 -out "$CERTS_DIR/rootCA.pem"

openssl req -new -sha256 -nodes -out "$CERTS_DIR/server.csr" -newkey rsa:2048 -keyout "$CERTS_DIR/server.key" -config <( cat "$THIS_DIR/server.csr.cnf" )
openssl x509 -req -in "$CERTS_DIR/server.csr" -CA "$CERTS_DIR/rootCA.pem" -CAkey "$CERTS_DIR/rootCA.key" -CAcreateserial -out "$CERTS_DIR/server.crt" -days 500 -sha256 -extfile "$THIS_DIR/v3.ext"
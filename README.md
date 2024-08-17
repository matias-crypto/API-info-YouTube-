## `API-FREE`


> Esta API es para buscar información sobre videos de YouTube con nombre, y está en desarrollo, puedes instalarla en hostings o en forma local.


### `ACTIVAR EN LOCAL CON TERMUX`

> Instalación de forma local.

*LIBRERIAS NECESARIAS:*

```bash
pkg install nodejs && pkg install git
```

*CLONAR GITHUB:* 

```bash
git clone https://github.com/matias-crypto/API-info-YouTube-
```
*INSTALAR LIBRERIAS:*

```bash
npm install
```
> NOTA: Si por alguna razón no te funciona npm, usa yarn install en este paso y/o yarn start en el siguiente paso.

*INICIAR API:*

```bash
npm start
```

> Cuando se inicie la API, se estará ejecutando en http://localhost:6666 o en el puerto que pusieron

*ACTIVAR CON URL PUBLICA:*

> Instalar esta API usando openssl para una URL pública, solamente deberías de seguir los pasos anteriores y los siguientes:

*INSTALAR OPENSSL:*

```bash
pkg install openssl
```

*EJECUTAR SERVEO:*

```bash
ssh -R api-crypto.serveo.net:80:localhost:6666 serveo.net
```

> NOTA: Tienes que poner el puerto que pusiste en index.js (El que usamos es 6666), si no cambiaste nada sigues los pasos como están, y puedes cambiar el nombre del subdominio, por defecto se llama api-crypto, y recuerda, no tienes que cerrar Termux porque se apagará la página, por eso es preferible usar hostings 24/7.









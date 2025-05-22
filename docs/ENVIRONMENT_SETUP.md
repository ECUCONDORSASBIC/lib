# Configuración de Variables de Entorno para Telemedicina

Este documento explica cómo configurar las variables de entorno necesarias para habilitar la funcionalidad de videollamadas con Daily.co y chat en tiempo real con Firebase Realtime Database.

## Requisitos Previos

1. Una cuenta en [Daily.co](https://www.daily.co/) (pueden obtener una cuenta gratuita para desarrollo)
2. Proyecto de Firebase configurado con Realtime Database habilitada (además de Firestore que ya están usando)

## Configuración de Variables de Entorno

Agregue las siguientes variables a su archivo `.env.local`:

```bash
# Firebase Realtime Database
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com

# Daily.co API
NEXT_PUBLIC_DAILY_API_KEY=tu-api-key-de-daily
DAILY_API_SECRET=tu-api-secret-de-daily

# Configuración para TURN servers
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_SERVER=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=your-turn-username
NEXT_PUBLIC_TURN_CREDENTIAL=your-turn-credential
```

## Obtener API Keys

### Daily.co

1. Regístrese para obtener una cuenta en [Daily.co](https://www.daily.co/)
2. Vaya a la sección de Dashboard > API
3. Copie su API Key y agréguela como `NEXT_PUBLIC_DAILY_API_KEY`
4. Para operaciones del servidor, también necesitará el API Secret

### Firebase Realtime Database

1. En su consola de Firebase, vaya a Realtime Database y habilite el servicio
2. Copie la URL de la base de datos (termina en .firebaseio.com)
3. Agregue esta URL como `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

## Configuración de TURN Servers

Para mejorar la conectividad en entornos con firewalls restrictivos y NATs, recomendamos configurar un servidor TURN. Puede utilizar servicios como:

- [Twilio Network Traversal Service](https://www.twilio.com/stun-turn)
- [Xirsys](https://xirsys.com/)

Estos servicios proporcionarán las credenciales necesarias para los servidores TURN.

## Integración con el código

El código ya ha sido configurado para utilizar estas variables de entorno:

- Los servicios de videollamada utilizarán automáticamente Daily.co cuando se proporcione la API Key
- El chat en tiempo real utilizará Firebase Realtime Database cuando se proporcione la URL

## Consideraciones para Producción

Para un entorno de producción, considere:

1. Rotar periódicamente las API keys por seguridad
2. Monitorear el uso de Daily.co y los límites de Firebase
3. Configurar Firebase Security Rules para proteger los datos del chat
4. Implementar encriptación de extremo a extremo para conversaciones sensibles
5. Configurar un servidor TURN dedicado para mayor confiabilidad

## Solución de Problemas

Si encuentra problemas con la conectividad de videollamadas:

1. Verifique que las credenciales de Daily.co sean correctas
2. Confirme que los servidores TURN estén configurados correctamente
3. Pruebe en diferentes navegadores para descartar problemas de compatibilidad
4. Revise los registros de la consola del navegador para mensajes de error específicos

Para problemas con el chat en tiempo real:

1. Verifique que la URL de Firebase Realtime Database sea correcta
2. Confirme que las reglas de seguridad permitan operaciones de lectura/escritura
3. Revise la conectividad a Firebase en la consola del navegador

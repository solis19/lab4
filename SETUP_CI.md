# 🚀 Guía de Configuración: GitHub Actions + SonarCloud

Esta guía te ayudará a configurar la integración continua paso a paso.

## 📋 Requisitos Previos

- Tener el proyecto en un repositorio de GitHub
- Cuenta de GitHub activa
- Acceso para modificar configuraciones del repositorio

---

## 🔧 Paso 1: Configurar SonarCloud

### 1.1 Crear cuenta en SonarCloud

1. Ve a [https://sonarcloud.io/](https://sonarcloud.io/)
2. Haz clic en **"Log in"** o **"Sign up"**
3. Selecciona **"With GitHub"**
4. Autoriza a SonarCloud para acceder a tu cuenta de GitHub

### 1.2 Importar tu proyecto

1. Una vez dentro de SonarCloud, haz clic en el **"+"** (arriba a la derecha)
2. Selecciona **"Analyze new project"**
3. Busca y selecciona tu repositorio **"encuestas-qr"** (o el nombre que tenga)
4. Haz clic en **"Set Up"**

### 1.3 Configurar el proyecto

1. Selecciona **"With GitHub Actions"** como método de análisis
2. SonarCloud te mostrará tu **Organization Key** y **Project Key**
3. **¡IMPORTANTE!** Copia estos valores, los necesitarás en el siguiente paso

Ejemplo:
```
Organization Key: tu-usuario-github
Project Key: tu-usuario-github_encuestas-qr
```

### 1.4 Generar el Token

1. SonarCloud te pedirá crear un token
2. Haz clic en **"Generate a token"**
3. Dale un nombre (ejemplo: "GitHub Actions Token")
4. **¡MUY IMPORTANTE!** Copia el token generado (solo se muestra una vez)

---

## 🔐 Paso 2: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Haz clic en **"Settings"** (configuración)
3. En el menú lateral, busca **"Secrets and variables"** → **"Actions"**
4. Haz clic en **"New repository secret"**
5. Crea un nuevo secret:
   - **Name:** `SONAR_TOKEN`
   - **Value:** Pega el token que copiaste de SonarCloud
6. Haz clic en **"Add secret"**

---

## 📝 Paso 3: Actualizar sonar-project.properties

1. Abre el archivo `sonar-project.properties` en tu proyecto
2. Reemplaza los valores con los que obtuviste de SonarCloud:

```properties
sonar.projectKey=tu-usuario-github_encuestas-qr
sonar.organization=tu-usuario-github
```

3. Guarda el archivo

---

## ✅ Paso 4: Hacer Push y Verificar

1. Agrega los cambios a git:
```bash
git add .
git commit -m "Configurar GitHub Actions y SonarCloud"
git push origin main
```

2. Ve a tu repositorio en GitHub
3. Haz clic en la pestaña **"Actions"**
4. Deberías ver tu workflow ejecutándose

---

## 🎯 ¿Qué hace el CI?

Cada vez que hagas push o crees un pull request, automáticamente:

1. ✅ **Instala las dependencias** del proyecto
2. ✅ **Ejecuta el linter** (ESLint) para verificar el código
3. ✅ **Hace el build** del proyecto para verificar que compila
4. ✅ **Analiza el código** con SonarCloud buscando:
   - Bugs potenciales
   - Vulnerabilidades de seguridad
   - Code smells (malas prácticas)
   - Duplicación de código
   - Cobertura de código (si tienes tests)

---

## 📊 Ver los Resultados

### En GitHub:
- Ve a la pestaña **"Actions"** de tu repositorio
- Verás el estado de cada ejecución (✅ éxito, ❌ error)

### En SonarCloud:
- Ve a [https://sonarcloud.io/](https://sonarcloud.io/)
- Selecciona tu proyecto
- Verás un dashboard con métricas de calidad:
  - **Bugs:** Errores potenciales
  - **Vulnerabilities:** Problemas de seguridad
  - **Code Smells:** Malas prácticas
  - **Coverage:** Cobertura de tests
  - **Duplications:** Código duplicado

---

## 🐛 Solución de Problemas

### Error: "SONAR_TOKEN not found"
- Verifica que agregaste el secret en GitHub con el nombre exacto `SONAR_TOKEN`
- Asegúrate de que el token sea válido

### Error: "Project key not found"
- Verifica que el `sonar.projectKey` en `sonar-project.properties` coincida con el de SonarCloud
- Verifica que el `sonar.organization` sea correcto

### El workflow no se ejecuta
- Asegúrate de que el archivo `.github/workflows/ci.yml` esté en la rama correcta
- Verifica que GitHub Actions esté habilitado en tu repositorio (Settings → Actions → General)

---

## 🎓 Para tu Entrega Universitaria

Puedes incluir en tu documentación:

1. **Capturas de pantalla:**
   - Dashboard de SonarCloud mostrando las métricas
   - Pestaña Actions en GitHub mostrando builds exitosos
   - Badges de estado (opcional)

2. **Explicación:**
   - "Se implementó integración continua con GitHub Actions"
   - "Se configuró análisis estático de código con SonarCloud"
   - "El pipeline verifica automáticamente: linting, build y calidad de código"

3. **Badges (opcional):**
   Puedes agregar badges al README para mostrar el estado:
   - Ve a SonarCloud → Tu proyecto → Project Information
   - Copia los badges y pégalos en tu README.md

---

## 📚 Recursos Adicionales

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Documentación de SonarCloud](https://docs.sonarcloud.io/)
- [Guía de SonarCloud para JavaScript/TypeScript](https://docs.sonarcloud.io/advanced-setup/languages/javascript-typescript/)

---

¡Listo! Ahora tu proyecto tiene integración continua configurada. 🎉



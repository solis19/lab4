# 📤 Cómo Subir la Carpeta .github a GitHub

Si la carpeta `.github` no aparece en tu repositorio, sigue estos pasos:

## 🔧 Solución Rápida

### Paso 1: Verificar que los archivos existen localmente

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# En Windows (PowerShell)
dir .github\workflows

# Deberías ver:
# ci.yml
# lint-only.yml
```

### Paso 2: Agregar los archivos a Git

```bash
# Agregar la carpeta .github completa
git add .github/

# Agregar el archivo de SonarCloud
git add sonar-project.properties

# (Opcional) Agregar los archivos de documentación
git add SETUP_CI.md VERIFICACION_CI.md SOLUCION_ACTIONS.md
```

### Paso 3: Verificar qué se va a subir

```bash
git status
```

Deberías ver algo como:
```
Changes to be committed:
  new file:   .github/workflows/ci.yml
  new file:   .github/workflows/lint-only.yml
  new file:   sonar-project.properties
```

### Paso 4: Hacer Commit

```bash
git commit -m "feat: Agregar GitHub Actions y configuración SonarCloud"
```

### Paso 5: Hacer Push

```bash
git push origin main
```

---

## ✅ Verificar que se subió

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Code"**
3. Deberías ver la carpeta **`.github`** en la lista
4. Haz clic en `.github` → `workflows` → deberías ver `ci.yml` y `lint-only.yml`

---

## 🐛 Si aún no funciona

### Problema: "nothing to commit"

Si `git status` muestra "nothing to commit", los archivos ya están agregados. Solo necesitas hacer push:

```bash
git push origin main
```

### Problema: Los archivos están en .gitignore

Verifica que `.github` no esté en tu `.gitignore`. Si está, elimínalo de ahí.

### Problema: Error de permisos

Si hay un error de autenticación, verifica que tengas permisos para hacer push al repositorio.

---

## 🎯 Comandos Completos (Copia y Pega)

```bash
# 1. Agregar archivos
git add .github/ sonar-project.properties

# 2. Verificar
git status

# 3. Commit
git commit -m "feat: Agregar GitHub Actions y SonarCloud"

# 4. Push
git push origin main
```

---

¡Después de esto, la carpeta `.github` debería aparecer en tu repositorio! 🎉



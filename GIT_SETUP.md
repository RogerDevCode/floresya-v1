# Configuración de Git para el proyecto FloresYa

## Información del usuario de Git

```bash
git config user.name "Roger"
git config user.email "roger@floresya.com.ve"
```

## Configuración remota

Este repositorio está configurado para usar HTTPS en lugar de SSH para mayor compatibilidad:

```bash
git remote set-url origin https://github.com/RogerDevCode/floresya-v1.git
```

## Credenciales

Para autenticar con GitHub usando HTTPS, necesitas usar un Personal Access Token (PAT) en lugar de tu contraseña habitual.

### Cómo crear un Personal Access Token:

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens)
2. Haz clic en "Generate new token"
3. Selecciona "Fine-grained personal access token" o "Classic personal access token"
4. Da un nombre a tu token
5. Establece los permisos necesarios (generalmente repo, workflow, user:email)
6. Copia el token generado

### Cómo usar el token:

Cuando Git te solicite credenciales:

- Usuario: tu nombre de usuario de GitHub
- Contraseña: el token generado

Opcionalmente, puedes configurar Git para que almacene temporalmente las credenciales:

```bash
git config --global credential.helper cache
# Esto almacenará las credenciales en caché por 15 minutos por defecto
```

Para aumentar el tiempo de caché a 1 hora (3600 segundos):

```bash
git config --global credential.helper 'cache --timeout=3600'
```

## Script gitp.sh

Para facilitar el proceso de commit y push, el proyecto incluye el script `gitp.sh`:

```bash
./gitp.sh "tu mensaje de commit"
```

Este script ejecutará: `git add .`, `git commit -m "mensaje"`, `git pull --rebase` y `git push`, en ese orden.

## Configuración de SSH (Opcional)

Si prefieres usar SSH en lugar de HTTPS, necesitas:

### Método 1: Clave SSH única para un repositorio

1. Generar un par de claves SSH:

   ```bash
   ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
   ```

2. Agregar la clave al agente SSH:

   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/nombre_de_tu_clave
   ```

3. Copiar la clave pública:

   ```bash
   cat ~/.ssh/nombre_de_tu_clave.pub
   ```

4. Agregar la clave pública a tu cuenta de GitHub en [github.com/settings/keys](https://github.com/settings/keys)

5. Cambiar la URL remota a SSH:
   ```bash
   git remote set-url origin git@github.com:tu_usuario/nombre_repo.git
   ```

### Método 2: Claves SSH específicas para múltiples repositorios (Recomendado para FloresYa)

Este método es especialmente útil si trabajas con múltiples repositorios, como en el caso de FloresYa:

1. Generar clave SSH específica para este repositorio:

   ```bash
   ssh-keygen -t ed25519 -C "floresya-v1@manager.com" -f ~/.ssh/floresya-v1-deploy-key -N ""
   ```

2. Configurar el archivo SSH (~/.ssh/config) con un alias específico:

   ```
   Host github.com-floresya-v1
     HostName github.com
     IdentityFile ~/.ssh/floresya-v1-deploy-key
     IdentitiesOnly yes
   ```

3. Copiar la clave pública generada:

   ```bash
   cat ~/.ssh/floresya-v1-deploy-key.pub
   ```

4. Agregar la clave pública a tu cuenta de GitHub en [github.com/settings/keys](https://github.com/settings/keys)

5. Cambiar la URL remota a usar el alias SSH:

   ```bash
   git remote set-url origin git@github.com-floresya-v1:RogerDevCode/floresya-v1.git
   ```

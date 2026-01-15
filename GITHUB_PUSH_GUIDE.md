# How to Push This Project to GitHub

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. Fill in the repository details:
   - **Repository name**: `solespace-admin` (or your preferred name)
   - **Description**: SoleSpace - Shoe Store Admin Management System
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Link Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "c:\xampp\htdocs\thesis - admin"

# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO with your details)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify the remote was added
git remote -v
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/solespace-admin.git
```

## Step 3: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin master
```

If you're using `main` as default branch instead of `master`:
```bash
git branch -M main
git push -u origin main
```

## Step 4: Enter Your Credentials

When prompted:
- Enter your GitHub username
- For password, use a **Personal Access Token** (not your GitHub password)

### How to Create a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "SoleSpace Project")
4. Select scopes: ✓ **repo** (full control)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

## Alternative: Using GitHub Desktop (Easier)

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in to your GitHub account
3. Click "Add" → "Add existing repository"
4. Browse to `C:\xampp\htdocs\thesis - admin`
5. Click "Publish repository"
6. Choose public or private
7. Click "Publish repository"

## Verification

After pushing, verify your code is on GitHub:
1. Go to your repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. You should see all your files including the README.md

## Updating the Repository URL in README

After creating your repository, update the README.md clone command:

```bash
cd "c:\xampp\htdocs\thesis - admin"
```

Edit `README.md` and replace:
```
git clone <your-repository-url>
```

With your actual URL:
```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Then commit and push the change:
```bash
git add README.md
git commit -m "Update repository URL in README"
git push
```

## Common Issues

### Issue: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Issue: Authentication failed
- Make sure you're using a Personal Access Token, not your password
- Token must have `repo` permissions

### Issue: "src refspec master does not match any"
```bash
# Check your branch name
git branch

# If it shows 'main' instead of 'master', use:
git push -u origin main
```

## Next Steps After Pushing

1. Add a nice repository description on GitHub
2. Add topics/tags: `laravel`, `react`, `inertia`, `admin-panel`, `php`, `mysql`
3. Consider adding a LICENSE file
4. Add screenshots to a `screenshots/` folder
5. Update README.md with actual screenshots

## File Structure on GitHub

Your repository will contain:
```
solespace-admin/
├── .gitignore
├── README.md
├── backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   └── ... (all backend files)
└── ... (documentation files)
```

Note: The following are excluded by .gitignore:
- `backend/vendor/`
- `backend/node_modules/`
- `backend/.env`
- Build artifacts

## Collaborators

To add collaborators to your repository:
1. Go to repository Settings → Collaborators
2. Click "Add people"
3. Enter their GitHub username
4. They'll receive an invitation email

---

**You're all set!** Your project is now on GitHub with complete documentation.

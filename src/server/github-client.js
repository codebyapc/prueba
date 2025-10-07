const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

class GitHubClient {
  constructor(config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
      baseUrl: config.baseUrl || 'https://api.github.com'
    });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  // Información del repositorio
  async getRepositoryInfo() {
    try {
      const response = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener información del repositorio: ${error.message}`);
    }
  }

  // Crear repositorio
  async createRepository(name, options = {}) {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name,
        description: options.description || '',
        private: options.private || false,
        auto_init: options.autoInit || true,
        license_template: options.license || 'mit'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear repositorio: ${error.message}`);
    }
  }

  // Listar ramas
  async listBranches() {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: this.owner,
        repo: this.repo
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al listar ramas: ${error.message}`);
    }
  }

  // Crear rama
  async createBranch(branchName, baseBranch = 'main') {
    try {
      // Obtener el SHA del base branch
      const baseBranchInfo = await this.octokit.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch: baseBranch
      });

      // Crear nueva rama
      const response = await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: baseBranchInfo.data.commit.sha
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error al crear rama: ${error.message}`);
    }
  }

  // Crear pull request
  async createPullRequest(title, body, head, base = 'main') {
    try {
      const response = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head,
        base
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear pull request: ${error.message}`);
    }
  }

  // Merge pull request
  async mergePullRequest(pullNumber, mergeMethod = 'merge') {
    try {
      const response = await this.octokit.pulls.merge({
        owner: this.owner,
        repo: this.repo,
        pull_number: pullNumber,
        merge_method: mergeMethod
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al merge pull request: ${error.message}`);
    }
  }

  // Listar pull requests
  async listPullRequests(state = 'open') {
    try {
      const response = await this.octokit.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al listar pull requests: ${error.message}`);
    }
  }

  // Crear issue
  async createIssue(title, body, labels = []) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        labels
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear issue: ${error.message}`);
    }
  }

  // Listar issues
  async listIssues(state = 'open') {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al listar issues: ${error.message}`);
    }
  }

  // Crear commit
  async createCommit(message, files, branch = 'main') {
    try {
      // Obtener el último commit SHA
      const branchInfo = await this.octokit.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch
      });

      // Crear árbol con los archivos
      const fileBlobs = await Promise.all(
        files.map(async (file) => {
          const blob = await this.octokit.git.createBlob({
            owner: this.owner,
            repo: this.repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64'
          });

          return {
            sha: blob.data.sha,
            path: file.path,
            mode: '100644',
            type: 'blob'
          };
        })
      );

      // Crear árbol
      const tree = await this.octokit.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: branchInfo.data.commit.commit.tree.sha,
        tree: fileBlobs
      });

      // Crear commit
      const commit = await this.octokit.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message,
        tree: tree.data.sha,
        parents: [branchInfo.data.commit.sha]
      });

      // Actualizar referencia de la rama
      await this.octokit.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branch}`,
        sha: commit.data.sha
      });

      return commit.data;
    } catch (error) {
      throw new Error(`Error al crear commit: ${error.message}`);
    }
  }

  // Listar commits
  async listCommits(sha = 'main', perPage = 30) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al listar commits: ${error.message}`);
    }
  }

  // Crear release
  async createRelease(tagName, name, body, branch = 'main') {
    try {
      const response = await this.octokit.repos.createRelease({
        owner: this.owner,
        repo: this.repo,
        tag_name: tagName,
        name,
        body,
        target_commitish: branch
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear release: ${error.message}`);
    }
  }

  // Listar releases
  async listReleases() {
    try {
      const response = await this.octokit.repos.listReleases({
        owner: this.owner,
        repo: this.repo
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al listar releases: ${error.message}`);
    }
  }

  // Eliminar rama
  async deleteBranch(branchName) {
    try {
      const response = await this.octokit.git.deleteRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar rama: ${error.message}`);
    }
  }

  // Cerrar issue
  async closeIssue(issueNumber) {
    try {
      const response = await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al cerrar issue: ${error.message}`);
    }
  }
}

module.exports = GitHubClient;
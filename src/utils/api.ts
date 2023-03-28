class Api {
  origin: string;
  prefix?: string;

  constructor(origin: string, prefix?: string) {
    this.origin = origin;
    this.prefix = prefix;
  }

  async get(endpoint: string) {
    const url = `${this.origin}${this.prefix ?? ''}${endpoint}`;
    const response = await fetch(url);
    return await response.json();
  }

  async post(endpoint: string, data?: any) {
    const url = `${this.origin}${this.prefix ?? ''}${endpoint}`;
    const body = data ? JSON.stringify(data) : undefined;
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers,
    });
    return await response.json();
  }
}

class Router {
  artist: Api;
  auth: Api;
  campaign: Api;
  comment: Api;
  company: Api;
  like: Api;
  proposal: Api;
  reportComment: Api;
  reward: Api;
  user: Api;

  constructor(origin: string) {
    this.artist = new Api(origin, '/artist');
    this.auth = new Api(origin, '/auth');
    this.campaign = new Api(origin, '/campaign');
    this.comment = new Api(origin, '/comment');
    this.company = new Api(origin, '/company');
    this.like = new Api(origin, '/like');
    this.proposal = new Api(origin, '/proposal');
    this.reportComment = new Api(origin, '/reportComment');
    this.reward = new Api(origin, '/reward');
    this.user = new Api(origin, '/user');
  }
}

//export const BACKEND_URL = 'http://localhost:8000';
export const BACKEND_URL = 'https://updoot-backend-mvp.herokuapp.com';
export default new Router(`${BACKEND_URL}/api`);

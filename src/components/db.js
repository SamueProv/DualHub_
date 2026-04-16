/**
 * db.js — localStorage "database" per DualHub
 */

// ── UTENTI ──────────────────────────────────────────────
export function getUsers() {
  return JSON.parse(localStorage.getItem("dh_users") || "[]");
}
export function saveUsers(users) {
  localStorage.setItem("dh_users", JSON.stringify(users));
}
export function getUser(username) {
  return getUsers().find((u) => u.username === username) || null;
}

// ── AMICIZIE ────────────────────────────────────────────
function getFriendData() {
  return JSON.parse(localStorage.getItem("dh_friends") || "{}");
}
function saveFriendData(data) {
  localStorage.setItem("dh_friends", JSON.stringify(data));
}
export function getFriends(username) {
  return getFriendData()[username]?.friends || [];
}
export function getFriendRequests(username) {
  return getFriendData()[username]?.requests || [];
}
export function sendFriendRequest(from, to) {
  const data = getFriendData();
  if (!data[to]) data[to] = { friends: [], requests: [] };
  if (!data[to].requests.includes(from) && !data[to].friends.includes(from)) {
    data[to].requests.push(from);
    saveFriendData(data);
    return true;
  }
  return false;
}
export function acceptFriendRequest(username, from) {
  const data = getFriendData();
  if (!data[username]) data[username] = { friends: [], requests: [] };
  if (!data[from]) data[from] = { friends: [], requests: [] };
  data[username].requests = data[username].requests.filter((r) => r !== from);
  if (!data[username].friends.includes(from)) data[username].friends.push(from);
  if (!data[from].friends.includes(username)) data[from].friends.push(username);
  saveFriendData(data);
}
export function rejectFriendRequest(username, from) {
  const data = getFriendData();
  if (!data[username]) return;
  data[username].requests = data[username].requests.filter((r) => r !== from);
  saveFriendData(data);
}
export function removeFriend(username, friend) {
  const data = getFriendData();
  if (data[username]) data[username].friends = data[username].friends.filter((f) => f !== friend);
  if (data[friend]) data[friend].friends = data[friend].friends.filter((f) => f !== username);
  saveFriendData(data);
}
export function isFriend(username, other) {
  return getFriends(username).includes(other);
}
export function hasPendingRequest(from, to) {
  return getFriendRequests(to).includes(from);
}

// ── POST ────────────────────────────────────────────────
export function getPosts(hub) {
  return JSON.parse(localStorage.getItem("dh_posts_" + hub) || "[]");
}
export function savePosts(hub, posts) {
  localStorage.setItem("dh_posts_" + hub, JSON.stringify(posts));
}
export function addPost(hub, post) {
  const posts = getPosts(hub);
  posts.unshift(post);
  savePosts(hub, posts);
  return post;
}
export function deletePost(hub, postId, username) {
  const posts = getPosts(hub).filter((p) => !(p.id === postId && p.user === username));
  savePosts(hub, posts);
}

// ── LIKE ────────────────────────────────────────────────
export function getLikes(hub) {
  return JSON.parse(localStorage.getItem("dh_likes_" + hub) || "{}");
}
export function toggleLike(hub, postId, username) {
  const likes = getLikes(hub);
  if (!likes[postId]) likes[postId] = [];
  const idx = likes[postId].indexOf(username);
  if (idx === -1) likes[postId].push(username);
  else likes[postId].splice(idx, 1);
  localStorage.setItem("dh_likes_" + hub, JSON.stringify(likes));
  return likes[postId];
}
export function getPostLikes(hub, postId) {
  return getLikes(hub)[postId] || [];
}

// ── COMMENTI ────────────────────────────────────────────
export function getComments(hub) {
  return JSON.parse(localStorage.getItem("dh_comments_" + hub) || "{}");
}
export function addComment(hub, postId, comment) {
  const all = getComments(hub);
  if (!all[postId]) all[postId] = [];
  all[postId].push(comment);
  localStorage.setItem("dh_comments_" + hub, JSON.stringify(all));
  return all[postId];
}
export function getPostComments(hub, postId) {
  return getComments(hub)[postId] || [];
}

// ── CONDIVISIONI ────────────────────────────────────────
export function sharePost(hub, postId, username) {
  const key = "dh_shares_" + hub;
  const shares = JSON.parse(localStorage.getItem(key) || "{}");
  if (!shares[postId]) shares[postId] = [];
  if (!shares[postId].includes(username)) shares[postId].push(username);
  localStorage.setItem(key, JSON.stringify(shares));
  return shares[postId].length;
}
export function getPostShares(hub, postId) {
  const shares = JSON.parse(localStorage.getItem("dh_shares_" + hub) || "{}");
  return (shares[postId] || []).length;
}

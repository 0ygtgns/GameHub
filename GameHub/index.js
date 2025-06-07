// --- Supabase Configuration ---
const SUPABASE_URL = 'Your Supabase URL here';
const SUPABASE_ANON_KEY = 'Your Supabase Anon Key here';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const loadingStateDiv = document.getElementById('loading-state');
const appDiv = document.getElementById('app');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const gameGrid = document.getElementById('game-grid');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardModal = document.getElementById('leaderboard-modal');
const closeLeaderboardModalBtn = document.getElementById('close-leaderboard-modal');
const leaderboardGameSelect = document.getElementById('leaderboard-game-select');
const leaderboardList = document.getElementById('leaderboard-list');

// --- Main Application Logic ---
async function main() {
    const { data: { session }, error } = await _supabase.auth.getSession();

    if (error || !session) {
        window.location.href = 'login.html';
        return;
    }

    userEmailSpan.textContent = session.user.email;
    loadingStateDiv.classList.add('hidden');
    appDiv.classList.remove('hidden');

    logoutBtn.addEventListener('click', async () => { await _supabase.auth.signOut(); window.location.href = 'login.html'; });
    
    populateGames();
    setupLeaderboard();
}

function populateGames() {
    const games = [
        { id: 'snake', title: 'Snake', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.95 13.5c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5 2.5-1.119 2.5-2.5-1.119-2.5-2.5-2.5Zm-8.125-5.625a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 18.5V9a6 6 0 0 1 6-6h3.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a2 2 0 0 0-2 2v9.5a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5V16a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.5a6.5 6.5 0 0 1-6.5 6.5h-10A2.5 2.5 0 0 1 3 18.5Z"/></svg>`, scoreBased: true },
        { id: 'flappy-bird', title: 'Flappy Bird', icon: `<i class="fas fa-kiwi-bird"></i>`, scoreBased: true },
        { id: 'breakout', title: 'Breakout', icon: `<i class="fas fa-border-none"></i>`, scoreBased: true },
        { id: 'asteroids', title: 'Asteroids', icon: `<i class="fas fa-meteor"></i>`, scoreBased: true },
        { id: '2048', title: '2048', icon: `<i class="fas fa-th"></i>`, scoreBased: true },
        { id: 'memory', title: 'Memory Game', icon: `<i class="fas fa-brain"></i>`, scoreBased: true }, // <-- ADDED scoreBased: true
        { id: 'tic-tac-toe', title: 'Tic Tac Toe', icon: `<i class="fas fa-times"></i>` },
        { id: 'pong', title: 'Pong', icon: `<i class="fas fa-table-tennis"></i>` },
        { id: 'rock-paper-scissors', title: 'Rock Paper Scissors', icon: `<i class="fas fa-hand-rock"></i>` },
        { id: 'connect-four', title: 'Connect Four', icon: `<i class="fas fa-braille"></i>` },
        { id: 'minesweeper', title: 'Minesweeper', icon: `<i class="fas fa-bomb"></i>` },
        { id: 'hangman', title: 'Hangman', icon: `<i class="fas fa-user-secret"></i>` },
        { id: 'sudoku', title: 'Sudoku', icon: `<i class="fas fa-border-all"></i>` },
    ];

    games.forEach(game => {
        const gameLink = document.createElement('a');
        gameLink.href = `games/${game.id}.html`;
        
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<div class="game-card-icon">${game.icon}</div><h3>${game.title}</h3><p>Click to Play</p>`;
        
        gameLink.appendChild(card);
        gameGrid.appendChild(gameLink);

        if (game.scoreBased) {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.title;
            leaderboardGameSelect.appendChild(option);
        }
    });
}

function setupLeaderboard() {
    leaderboardBtn.addEventListener('click', () => {
        fetchAndDisplayLeaderboard(leaderboardGameSelect.value);
        leaderboardModal.classList.remove('hidden');
    });
    closeLeaderboardModalBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));
    leaderboardGameSelect.addEventListener('change', (e) => fetchAndDisplayLeaderboard(e.target.value));
}

async function fetchAndDisplayLeaderboard(gameId) {
    leaderboardList.innerHTML = `<p class="text-center text-slate-400">Loading scores...</p>`;
    
    const { data, error } = await _supabase
        .from('scores')
        .select(`score, profiles ( email )`)
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        leaderboardList.innerHTML = `<p class="text-center text-red-400">Could not load leaderboard.</p>`;
        return;
    }

    if (!data || data.length === 0) {
        leaderboardList.innerHTML = '<p class="text-center text-slate-400">No scores yet. Be the first!</p>';
    } else {
        leaderboardList.innerHTML = data.map((entry, index) => {
            const rank = index + 1;
            const email = entry.profiles ? entry.profiles.email.split('@')[0] : 'Anonymous';
            const rankColor = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
            const rankIcon = rank === 1 ? '<i class="fas fa-crown"></i>' : rank === 2 ? '<i class="fas fa-medal"></i>' : rank === 3 ? '<i class="fas fa-award"></i>' : `${rank}.`;
            
            return `<div class="leaderboard-entry">
                        <span class="rank ${rankColor}">${rankIcon}</span>
                        <span class="email">${email}</span>
                        <span class="score">${entry.score}</span>
                    </div>`;
        }).join('');
    }
}

// --- Run the Application ---
main();

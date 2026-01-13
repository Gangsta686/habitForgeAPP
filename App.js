import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';

const PURPLE = '#7C3AED';
const DARK_BG = '#0F172A';
const LIGHT_BG = '#FFFFFF';
const LIGHT_TEXT = '#0F172A';
const DARK_TEXT = '#F9FAFB';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  // Simple navigation between screens
  const [screen, setScreen] = useState('home'); // 'home' | 'habits' | 'challenge' | 'profile' | 'help'

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Habit state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habits, setHabits] = useState([]);

  // Challenge state
  const ENTRY_FEE = 500;
  const MAX_PARTICIPANTS = 10;
  const [participants, setParticipants] = useState([]);
  const [nickname, setNickname] = useState('');
  const [winner, setWinner] = useState(null);

  // Profile / stats state
  const avatarOptions = ['🔥', '🚀', '🏆', '🧠', '🦾', '🐉'];
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [doneDays, setDoneDays] = useState(0);
  const [failedDays, setFailedDays] = useState(0);
  const [inProgressDays, setInProgressDays] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [averageBet, setAverageBet] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lastTopUp, setLastTopUp] = useState(0);

  const backgroundColor = isDark ? DARK_BG : LIGHT_BG;
  const textColor = isDark ? DARK_TEXT : LIGHT_TEXT;
  const cardColor = isDark ? '#020617' : '#F9FAFB';
  const secondaryText = isDark ? '#CBD5F5' : '#6B7280';

  const prizePool = participants.length * ENTRY_FEE;
  const ownerShare = Math.round(prizePool * 0.2);
  const winnerShare = prizePool - ownerShare;

  const totalDays = doneDays + failedDays + inProgressDays;
  const successPercent =
    totalDays === 0 ? 0 : Math.round((doneDays / totalDays) * 100);

  const addHabit = () => {
    if (!habitTitle.trim()) return;
    const newHabit = {
      id: Date.now().toString(),
      title: habitTitle.trim(),
      description: habitDescription.trim(),
      progress: 0,
    };
    setHabits((prev) => [newHabit, ...prev]);
    setHabitTitle('');
    setHabitDescription('');
  };

  const incrementHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, progress: h.progress + 1 } : h
      )
    );
    // Каждое успешное выполнение привычки считаем выполненным днём
    setDoneDays((prev) => prev + 1);
  };

  const joinChallenge = () => {
    if (participants.length >= MAX_PARTICIPANTS) return;
    if (!nickname.trim()) return;
    const exists = participants.some(
      (p) => p.name.toLowerCase() === nickname.trim().toLowerCase()
    );
    if (exists) return;
    setParticipants((prev) => [
      ...prev,
      { id: Date.now().toString(), name: nickname.trim() },
    ]);
    setNickname('');
    setWinner(null);

    // Учитываем ставку участника в личной статистике
    setTotalBets((prevTotal) => {
      const newTotal = prevTotal + ENTRY_FEE;
      const newCount = (prevTotal === 0 ? 1 : Math.round(prevTotal / (averageBet || ENTRY_FEE))) + 1;
      const newAverage = Math.round(newTotal / newCount);
      setAverageBet(newAverage);
      return newTotal;
    });
  };

  const pickWinner = () => {
    if (participants.length === 0) return;
    const index = Math.floor(Math.random() * participants.length);
    setWinner(participants[index]);
  };

  const renderHabit = ({ item }) => (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.smallPurpleButton}
          onPress={() => incrementHabit(item.id)}
        >
          <Text style={styles.smallPurpleButtonText}>+1</Text>
        </TouchableOpacity>
      </View>
      {item.description ? (
        <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
          {item.description}
        </Text>
      ) : null}
      <Text style={[styles.progressText, { color: secondaryText }]}>
        Завершено: {item.progress}
      </Text>
    </View>
  );

  const cycleAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % avatarOptions.length);
  };

  const incrementFailed = () => {
    setFailedDays((prev) => prev + 1);
  };

  const incrementInProgress = () => {
    setInProgressDays((prev) => prev + 1);
  };

  const handleTopUp = (amount) => {
    setBalance((prev) => prev + amount);
    setLastTopUp(amount);
  };

  const renderBackButton = () =>
    screen !== 'home' ? (
      <TouchableOpacity
        onPress={() => setScreen('home')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>
          ← Назад в меню
        </Text>
      </TouchableOpacity>
    ) : null;

  const handleAuthSubmit = () => {
    setAuthError('');
    if (authMode === 'register' && !authName.trim()) {
      setAuthError('Укажи имя.');
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Заполни почту и пароль.');
      return;
    }
    // Здесь могла бы быть реальная проверка/регистрация через сервер.
    // Для прототипа просто пускаем пользователя в приложение.
    setIsAuthenticated(true);
    setScreen('home');
  };

  const renderAuthScreen = () => (
    <View style={styles.section}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.appIcon}
        />
      </View>
      <Text style={[styles.homeTitle, { color: PURPLE, marginTop: 16 }]}>HabitForge</Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText, marginTop: 8 }]}>
        {authMode === 'login'
          ? 'Войди, чтобы продолжить свой путь привычек.'
          : 'Создай аккаунт и начни формировать новые привычки.'}
      </Text>

      <View style={styles.authSwitchRow}>
        <TouchableOpacity
          style={[
            styles.authSwitchButton,
            authMode === 'login' && styles.authSwitchButtonActive,
          ]}
          onPress={() => {
            setAuthMode('login');
            setAuthError('');
          }}
        >
          <Text
            style={[
              styles.authSwitchText,
              authMode === 'login' && styles.authSwitchTextActive,
            ]}
          >
            Вход
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.authSwitchButton,
            authMode === 'register' && styles.authSwitchButtonActive,
          ]}
          onPress={() => {
            setAuthMode('register');
            setAuthError('');
          }}
        >
          <Text
            style={[
              styles.authSwitchText,
              authMode === 'register' && styles.authSwitchTextActive,
            ]}
          >
            Регистрация
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCard}>
        {authMode === 'register' && (
          <TextInput
            placeholder="Имя / ник"
            placeholderTextColor={secondaryText}
            value={authName}
            onChangeText={setAuthName}
            style={[
              styles.input,
              { color: textColor, borderColor: '#E5E7EB' },
            ]}
          />
        )}

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={secondaryText}
          value={authEmail}
          onChangeText={setAuthEmail}
          style={[
            styles.input,
            { color: textColor, borderColor: '#E5E7EB' },
          ]}
        />

        <TextInput
          placeholder="Пароль"
          secureTextEntry
          placeholderTextColor={secondaryText}
          value={authPassword}
          onChangeText={setAuthPassword}
          style={[
            styles.input,
            { color: textColor, borderColor: '#E5E7EB' },
          ]}
        />

        {authError ? (
          <Text style={[styles.authErrorText, { color: '#DC2626' }]}>
            {authError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAuthSubmit}
        >
          <Text style={styles.primaryButtonText}>
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.authHintText, { color: secondaryText }]}>
          В текущей версии данные хранятся только на устройстве и используются
          как игровой вход без реального аккаунта.
        </Text>
      </View>
    </View>
  );

  const renderHome = () => (
    <View style={styles.section}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.appIcon}
        />
      </View>
      <Text style={[styles.homeTitle, { color: PURPLE }]}>HabitForge</Text>
      <Text style={[styles.homeSubtitle, { color: secondaryText }]}>
        Фитнес-трекер привычек с ответственностью
      </Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>
        Выбери раздел, с которого хочешь начать.
      </Text>

      <View style={styles.menuButtons}>
        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonHabits]}
          onPress={() => setScreen('habits')}
        >
          <Text style={styles.menuButtonTitle}>🎯 Мои привычки</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonChallenge]}
          onPress={() => setScreen('challenge')}
        >
          <Text style={styles.menuButtonTitle}>🏆 Общий челлендж</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonProfile]}
          onPress={() => setScreen('profile')}
        >
          <Text style={styles.menuButtonTitle}>👤 Личный кабинет</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonHelp]}
          onPress={() => setScreen('help')}
        >
          <Text style={styles.menuButtonTitle}>❓ Справка по интерфейсу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHabitsScreen = () => (
    <View style={styles.section}>
      {renderBackButton()}
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        Мои привычки
      </Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>
        Ставь цель, отслеживай прогресс и превращай привычки в игру.
      </Text>

      <View style={styles.inputCard}>
        <TextInput
          placeholder="Цель (например: бег 3 раза в неделю)"
          placeholderTextColor={secondaryText}
          value={habitTitle}
          onChangeText={setHabitTitle}
          style={[
            styles.input,
            { color: textColor, borderColor: '#E5E7EB' },
          ]}
        />
        <TextInput
          placeholder="Краткое описание / правило"
          placeholderTextColor={secondaryText}
          value={habitDescription}
          onChangeText={setHabitDescription}
          style={[
            styles.input,
            { color: textColor, borderColor: '#E5E7EB' },
          ]}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={addHabit}>
          <Text style={styles.primaryButtonText}>Добавить привычку</Text>
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <Text style={[styles.emptyText, { color: secondaryText }]}>
          Пока нет привычек. Начни с первой цели выше.
        </Text>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabit}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  const renderChallengeScreen = () => (
    <View style={styles.section}>
      {renderBackButton()}
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        🏆 Общий челлендж (10 человек)
      </Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>
        💰 Вход: {ENTRY_FEE} ₽. 📊 20% от общей суммы уходит на благотворительность, остальное — в призовой фонд.
      </Text>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: cardColor, flex: 1 }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            📋 Условия
          </Text>
          <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
            👥 Максимум {MAX_PARTICIPANTS} участников{'\n'}
            💵 Входной взнос: {ENTRY_FEE} ₽ с человека{'\n'}
            💗 20% общей суммы автоматически уходит на благотворительность
          </Text>
        </View>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          placeholder="Ваш ник в челлендже"
          placeholderTextColor={secondaryText}
          value={nickname}
          onChangeText={setNickname}
          style={[
            styles.input,
            { color: textColor, borderColor: '#E5E7EB' },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.primaryButton,
            participants.length >= MAX_PARTICIPANTS && styles.disabledButton,
          ]}
          onPress={joinChallenge}
          disabled={participants.length >= MAX_PARTICIPANTS}
        >
          <Text style={styles.primaryButtonText}>
            {participants.length >= MAX_PARTICIPANTS
              ? '🚫 Челлендж заполнен'
              : '✅ Вступить за 500 ₽'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              👥 Участники
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {participants.length} / {MAX_PARTICIPANTS}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              💰 Призовой фонд
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {prizePool} ₽
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              💗 На благотворительность (20%)
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {ownerShare} ₽
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              🏅 Призовой фонд (80%)
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {winnerShare} ₽
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            👥 Участники
          </Text>
          <TouchableOpacity
            style={[
              styles.smallPurpleButton,
              participants.length === 0 && styles.disabledSmallButton,
            ]}
            onPress={pickWinner}
            disabled={participants.length === 0}
          >
            <Text style={styles.smallPurpleButtonText}>
              🎲 Выбрать победителя
            </Text>
          </TouchableOpacity>
        </View>

        {participants.length === 0 ? (
          <Text
            style={[
              styles.emptyText,
              { color: secondaryText, marginTop: 4 },
            ]}
          >
            Пока никто не вступил в челлендж.
          </Text>
        ) : (
          <View>
            {participants.map((p, index) => (
              <View key={p.id} style={styles.participantRow}>
                <Text
                  style={[styles.participantIndex, { color: secondaryText }]}
                >
                  #{index + 1}
                </Text>
                <Text style={[styles.participantName, { color: textColor }]}>
                  {p.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {winner && (
          <View style={styles.winnerCard}>
            <Text style={[styles.winnerLabel, { color: secondaryText }]}>
              🏆 Победитель:
            </Text>
            <Text style={[styles.winnerName, { color: textColor }]}>
              🎉 {winner.name} получает {winnerShare} ₽
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProfileScreen = () => (
    <View style={styles.section}>
      {renderBackButton()}
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        Личный кабинет
      </Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>
        Следи за своим прогрессом и настрой свой образ в HabitForge.
      </Text>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={cycleAvatar}
          >
            <Text style={styles.avatarText}>
              {avatarOptions[avatarIndex]}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Твой аватар
            </Text>
            <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
              Нажимай на аватар, чтобы сменить стиль.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          Общая статистика
        </Text>
        <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
          Здесь собрана сводка по твоим привычкам и челленджам.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Выполнено
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {doneDays} дней
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Срывы
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {failedDays} дней
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              В процессе
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {inProgressDays} дней
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Всего дней
            </Text>
            <Text style={[styles.statValueSmall, { color: textColor }]}>
              {totalDays}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Общая успешность
            </Text>
            <Text style={[styles.statValue, { color: textColor }]}>
              {successPercent}%
            </Text>
          </View>
        </View>

        <View style={styles.profileButtonsRow}>
          <TouchableOpacity
            style={styles.smallOutlineButton}
            onPress={incrementFailed}
          >
            <Text style={[styles.smallOutlineButtonText, { color: PURPLE }]}>
              +1 срыв
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallOutlineButton}
            onPress={incrementInProgress}
          >
            <Text style={[styles.smallOutlineButtonText, { color: PURPLE }]}>
              +1 в процессе
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          💳 Пополнение баланса
        </Text>
        <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
          Игровой баланс внутри HabitForge.
        </Text>

        <View style={styles.balanceRow}>
          <Text style={[styles.statLabel, { color: secondaryText }]}>
            Текущий баланс
          </Text>
          <Text style={[styles.balanceValue, { color: textColor }]}>
            {balance} ₽
          </Text>
        </View>

        <View style={styles.balanceBar}>
          <Text style={styles.balanceBarText}>
            {lastTopUp > 0
              ? `Выбранная сумма: +${lastTopUp} ₽`
              : 'Выбери сумму пополнения ниже'}
          </Text>
        </View>

        <View style={styles.topUpButtonsRow}>
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => handleTopUp(100)}
          >
            <Text style={styles.topUpButtonText}>+100 ₽</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => handleTopUp(500)}
          >
            <Text style={styles.topUpButtonText}>+500 ₽</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topUpButtonsRow}>
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => handleTopUp(1000)}
          >
            <Text style={styles.topUpButtonText}>+1000 ₽</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => handleTopUp(5000)}
          >
            <Text style={styles.topUpButtonText}>+5000 ₽</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          📊 Детальная статистика
        </Text>

        <Text style={[styles.profileStatLine, { color: textColor }]}>
          ✅ Выполнено: {doneDays} дней
        </Text>
        <Text style={[styles.profileStatLine, { color: textColor }]}>
          ❌ Пропущено: {failedDays} дней
        </Text>
        <Text style={[styles.profileStatLine, { color: textColor }]}>
          💰 Всего ставок: {totalBets} ₽
        </Text>
        <Text style={[styles.profileStatLine, { color: textColor }]}>
          🎯 Средняя ставка: {averageBet} ₽
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setIsAuthenticated(false)}
      >
        <Text style={styles.logoutButtonText}>🚪 Выход из аккаунта</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHelpScreen = () => (
    <View style={styles.section}>
      {renderBackButton()}
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        ❓ Справка по интерфейсу
      </Text>
      <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>
        ℹ️ Краткое описание возможностей HabitForge и как ими пользоваться.
      </Text>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          🧭 Главные разделы
        </Text>
        <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
          - 🎯 «Мои привычки» — создавай привычки, нажимай «+1» за каждый выполненный день.{'\n'}
          - 🏆 «Общий челлендж» — игра на 10 человек с фиксированной ставкой 500 ₽.{'\n'}
          - 👤 «Личный кабинет» — смотри статистику успехов, срывов и ставок, меняй аватар.{'\n'}
          - 🌗 Переключатель темы в правом верхнем углу — светлый/тёмный режим интерфейса.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          💸 Деньги и ответственность
        </Text>
        <Text style={[styles.cardSubtitle, { color: secondaryText }]}>
          В разделе челленджа автоматически считается общий призовой фонд: часть суммы (20%) закладывается как благотворительный взнос, остальное идёт в игровой призовой фонд. {'\n'}
          ⚠️ Реальные переводы денег и онлайн‑игра между людьми потребуют отдельного сервера и платёжных интеграций — в текущей версии приложение работает как симулятор.
        </Text>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              { borderColor: isDark ? DARK_TEXT : PURPLE },
            ]}
            onPress={() => setIsDark((prev) => !prev)}
          >
            <Text
              style={[
                styles.themeButtonText,
                { color: isDark ? DARK_TEXT : PURPLE },
              ]}
            >
              {isDark ? 'Светлая' : 'Тёмная'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isAuthenticated && renderAuthScreen()}
          {isAuthenticated && screen === 'home' && renderHome()}
          {isAuthenticated && screen === 'habits' && renderHabitsScreen()}
          {isAuthenticated && screen === 'challenge' && renderChallengeScreen()}
          {isAuthenticated && screen === 'profile' && renderProfileScreen()}
          {isAuthenticated && screen === 'help' && renderHelpScreen()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  inputCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  smallPurpleButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledSmallButton: {
    opacity: 0.5,
  },
  smallPurpleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  participantIndex: {
    fontSize: 12,
    width: 26,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
  },
  winnerCard: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  winnerLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  winnerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  backButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  authSwitchRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#F3E8FF',
    borderRadius: 999,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authSwitchButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  authSwitchButtonActive: {
    backgroundColor: PURPLE,
  },
  authSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: PURPLE,
  },
  authSwitchTextActive: {
    color: '#FFFFFF',
  },
  menuButtons: {
    marginTop: 8,
    gap: 10,
  },
  menuButton: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  menuButtonHabits: {
    backgroundColor: '#7C3AED',
  },
  menuButtonChallenge: {
    backgroundColor: '#7C3AED',
  },
  menuButtonProfile: {
    backgroundColor: '#F97316',
  },
  menuButtonHelp: {
    backgroundColor: '#7C3AED',
  },
  menuButtonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: PURPLE,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
  },
  profileButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  smallOutlineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  smallOutlineButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileStatLine: {
    marginTop: 4,
    fontSize: 13,
  },
  authErrorText: {
    fontSize: 12,
    marginBottom: 4,
  },
  authHintText: {
    fontSize: 11,
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  balanceBar: {
    backgroundColor: '#BBF7D0',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginBottom: 10,
  },
  balanceBarText: {
    color: '#14532D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  topUpButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  topUpButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  topUpButtonText: {
    color: '#ECFDF3',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

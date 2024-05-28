import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

const GameScreen = () => {
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const jumpValue = useRef(new Animated.Value(0)).current;
  const obstaclePosition = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const supplyPosition = useRef(new Animated.Value(Dimensions.get('window').width + 200)).current;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    startObstacleAnimation();
    startSupplyAnimation();
  }, []);

  useEffect(() => {
    if (gameOver) {
      Alert.alert('Game Over', `Your score is ${score}`, [
        { text: 'Restart', onPress: resetGame }
      ]);
    }
  }, [gameOver]);

  const startObstacleAnimation = () => {
    obstaclePosition.setValue(screenWidth);
    Animated.timing(obstaclePosition, {
      toValue: -50,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      if (detectCollision()) {
        setGameOver(true);
      } else {
        setScore(score => score + 1);
        startObstacleAnimation();
      }
    });
  };

  const startSupplyAnimation = () => {
    supplyPosition.setValue(screenWidth + 200);
    Animated.timing(supplyPosition, {
      toValue: -50,
      duration: 5000,
      useNativeDriver: true,
    }).start(() => {
      if (!detectCollision()) {
        startSupplyAnimation();
      }
    });
  };

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      Animated.timing(jumpValue, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(jumpValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIsJumping(false);
        });
      });
    }
  };

  const detectCollision = () => {
    const characterBottom = screenHeight - 150;
    const obstacleLeft = obstaclePosition.__getValue();
    const supplyLeft = supplyPosition.__getValue();

    if (obstacleLeft < 50 && obstacleLeft > 0 && !isJumping) {
      return true;
    }

    if (supplyLeft < 50 && supplyLeft > 0 && isJumping) {
      setScore(score => score + 10);
    }

    return false;
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    startObstacleAnimation();
    startSupplyAnimation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Animated.View style={[styles.character, { transform: [{ translateY: jumpValue }] }]}>
        <Text style={styles.characterText}>🏃</Text>
      </Animated.View>
      <Animated.View style={[styles.obstacle, { transform: [{ translateX: obstaclePosition }] }]}>
        <Text style={styles.obstacleText}>🪨</Text>
      </Animated.View>
      <Animated.View style={[styles.supply, { transform: [{ translateX: supplyPosition }] }]}>
        <Text style={styles.supplyText}>🍎</Text>
      </Animated.View>
      <TouchableOpacity style={styles.button} onPress={handleJump}>
        <Text style={styles.buttonText}>Jump</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#add8e6',
  },
  score: {
    fontSize: 24,
    margin: 10,
  },
  character: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
    borderRadius: 25,
    position: 'absolute',
    bottom: 100,
  },
  characterText: {
    fontSize: 30,
  },
  obstacle: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'brown',
    borderRadius: 25,
    position: 'absolute',
    bottom: 100,
  },
  obstacleText: {
    fontSize: 30,
  },
  supply: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 25,
    position: 'absolute',
    bottom: 150,
  },
  supplyText: {
    fontSize: 30,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    padding: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },  
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default GameScreen;

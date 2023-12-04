import type { TrainingData } from "/ai/ai.ts";
import { Move } from "/game.ts";

const data: TrainingData = [
  {
    name: "Expect reload on second turn",
    data: [
      {
        name: "First round is always reload",
        state: {
          myBulletsLoaded: 0,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 0,
        },
        move: Move.Reload,
      },
      {
        name: "If Reloaded Into Knife, Just Reload",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 1,
        },
        move: Move.Reload,
      },
      {
        name: "If Reloaded Into Block, Just Knife Out",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 1,
        },
        move: Move.TakeOutKnife,
      },
      {
        name: "If Reloaded Into Reload, Just Shoot",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 1,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 1,
        },
        move: Move.Shoot,
      },
    ],
    epochs: 20,
    tolerance: 0.01,
  },
  {
    name: "Playstyle Developer for Intermediate Stages",
    data: [
      {
        name: "Keeping A Healthy Supply of Bullets",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 6,
          myKnifeOut: true,
          opponentBulletsLoaded: 1,
          opponentShieldsRemaining: 7,
          opponentKnifeOut: true,
          turnCount: 8,
        },
        move: Move.Reload,  
      },
      {
        name: "Getting In Position To Stab",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 8,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 4,
        },
        move: Move.TakeOutKnife,  
      },
      {
        name: "Getting In Position To Shoot",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 3,
        },
        move: Move.Reload,  
      },
      {
        name: "Getting Suspicious of an Attacker",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 8,
          myKnifeOut: true,
          opponentBulletsLoaded: 3,
          opponentShieldsRemaining: 8,
          opponentKnifeOut: false,
          turnCount: 6,
        },
        move: Move.Block,
      },
      {
        name: "Getting Suspicious of a Bullet Hoarder",
        state: {
          myBulletsLoaded: 2,
          myShieldsRemaining: 8,
          myKnifeOut: true,
          opponentBulletsLoaded: 4,
          opponentShieldsRemaining: 8,
          opponentKnifeOut: true,
          turnCount: 6,
        },
        move: Move.Shoot,
      },
      {
        name: "Getting Suspicious of a Block Spammer",
        state: {
          myBulletsLoaded: 2,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 2,
          opponentShieldsRemaining: 7,
          opponentKnifeOut: false,
          turnCount: 7,
        },
        move: Move.Reload,
      },
      

    ],
    epochs: 20,
    tolerance: 0.05,
  },
  {
    name: "Conditions Where We Can Win",
    data: [
      {
        name: "We Shoot when They Can't Block",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 0,
          opponentKnifeOut: true,
          turnCount: 12,
        },
        move: Move.Shoot,  
      },
      {
        name: "We Stab when They Can't Shoot: 1 to 9",
        state: {
          myBulletsLoaded: 0,
          myShieldsRemaining: 9,
          myKnifeOut: true,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 5,
        },
        move: Move.Stab,  
      },
      {
        name: "We Stab when They Can't Shoot: 1 to 5",
        state: {
          myBulletsLoaded: 0,
          myShieldsRemaining: 9,
          myKnifeOut: true,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 5,
          opponentKnifeOut: false,
          turnCount: 9,
        },
        move: Move.Stab,  
      },
      {
        name: "We Shoot when They Can Stab",
        state: {
          myBulletsLoaded: 2,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 4,
        },
        move: Move.Shoot,  
      },
      {
        name: "We Have Too Many Bullets: 10 to 9",
        state: {
          myBulletsLoaded: 10,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 13,
        },
        move: Move.Shoot,  
      },
      {
        name: "We Have Too Many Bullets: 5 to 4",
        state: {
          myBulletsLoaded: 5,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 4,
          opponentKnifeOut: true,
          turnCount: 18,
        },
        move: Move.Shoot,  
      },
      {
        name: "We Have Bullet Surplus",
        state: {
          myBulletsLoaded: 3,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 2,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 4,
        },
        move: Move.Shoot,  
      }
      , 
      
    ],
    epochs: 10,
    tolerance: 0.01,
  },
];

export default data;

(function($, panel) {
  $.extend(panel, {
    items_db: {
      "pistols": {
        "magnum": {
          "name": "S&W Magnum",
          "cost": 400,
          "weight": 2,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "16-18",
          "precision": 100,
          "range": 1,
          "shots": 1,
          "shop": "gos"
        },
        "pm": {
          "name": "Пистолет Макарова",
          "cost": 400,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "15-17",
          "precision": 100,
          "range": 0,
          "shots": 1,
          "shop": "gos"
        },
        "rbcat": {
          "name": "Ruger BeerCat 22lr",
          "cost": 2500,
          "weight": 1,
          "dura": 15,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "12-15",
          "precision": 90,
          "range": 0,
          "shots": 1,
          "shop": "gos"
        },
        "ttgun": {
          "name": "Пистолет ТТ",
          "cost": 8000,
          "weight": 1,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "16-18",
          "precision": 100,
          "range": 0,
          "shots": 1,
          "shop": "gos"
        },
        "eagle": {
          "name": "Desert Eagle .50",
          "cost": 10000,
          "weight": 1,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "15-19",
          "precision": 100,
          "range": 0,
          "shots": 1,
          "shop": "gos"
        }
      },
      "auto": {
        "ak47": {
          "name": "АК-47",
          "cost": 800,
          "weight": 6,
          "dura": 20,
          "minLvl": 0,
          "damage": "4-7",
          "precision": 70,
          "range": 2,
          "shots": 8,
          "shop": "gos"
        },
        "schmeisser": {
          "name": "Schmeisser MKb42",
          "cost": 8000,
          "weight": 2,
          "dura": 20,
          "minLvl": 5,
          "damage": "2-8",
          "precision": 60,
          "range": 2,
          "shots": 12,
          "shop": "gos"
        },
        "m16": {
          "name": "M-16",
          "cost": 19000,
          "weight": 3,
          "dura": 20,
          "minLvl": 6,
          "damage": "5-12",
          "precision": 35,
          "range": 2,
          "shots": 12,
          "shop": "gos"
        },
        "ak_74": {
          "name": "АК-74",
          "cost": 18000,
          "weight": 2,
          "dura": 20,
          "minLvl": 7,
          "damage": "5-14",
          "precision": 30,
          "range": 2,
          "shots": 15,
          "shop": "gos"
        },
        "l1a1": {
          "name": "Enfield L1A1",
          "cost": 17000,
          "weight": 3,
          "dura": 20,
          "minLvl": 8,
          "damage": "5-11",
          "precision": 60,
          "range": 4,
          "shots": 12,
          "shop": "gos"
        },
        "aks": {
          "name": "АКС",
          "cost": 20000,
          "weight": 1,
          "dura": 14,
          "slots": ["lh", "rh"],
          "minLvl": 9,
          "damage": "5-12",
          "precision": 20,
          "range": 0,
          "shots": 15,
          "shop": "gos"
        },
        "hk53": {
          "name": "HK-53",
          "cost": 4000,
          "weight": 1,
          "dura": 10,
          "slots": ["lh", "rh"],
          "minLvl": 9,
          "damage": "6-13",
          "precision": 20,
          "range": 4,
          "shots": 15,
          "shop": "gos"
        },
        "sg541": {
          "name": "SG 541",
          "cost": 20000,
          "weight": 2,
          "dura": 15,
          "minLvl": 10,
          "damage": "9-15",
          "precision": 60,
          "range": 6,
          "shots": 10,
          "shop": "gos"
        },
        "xm8": {
          "name": "XM8",
          "cost": 32000,
          "weight": 4,
          "dura": 20,
          "minLvl": 11,
          "damage": "6-12",
          "precision": 70,
          "range": 6,
          "shots": 12,
          "shop": "gos"
        },
        "steyr": {
          "name": "Steyr AUG",
          "cost": 60000,
          "weight": 3,
          "dura": 22,
          "minLvl": 12,
          "damage": "13-16",
          "precision": 70,
          "range": 7,
          "shots": 10,
          "shop": "gos"
        },
        "trw": {
          "name": "TRW LMR",
          "cost": 65000,
          "weight": 4,
          "dura": 25,
          "minLvl": 13,
          "damage": "12-18",
          "precision": 65,
          "range": 8,
          "shots": 12,
          "shop": "gos"
        },
        "sig": {
          "name": "SIG-550",
          "cost": 85000,
          "weight": 6,
          "dura": 24,
          "minLvl": 14,
          "damage": "14-16",
          "precision": 70,
          "range": 10,
          "shots": 15,
          "shop": "gos"
        },
        "stg44": {
          "name": "STG-44",
          "cost": 85000,
          "weight": 5,
          "dura": 22,
          "minLvl": 15,
          "damage": "17-20",
          "precision": 60,
          "range": 8,
          "shots": 15,
          "shop": "gos"
        },
        "m14": {
          "name": "M14",
          "cost": 80000,
          "weight": 5,
          "dura": 20,
          "minLvl": 16,
          "damage": "12-18",
          "precision": 70,
          "range": 10,
          "shots": 12,
          "shop": "gos"
        },
        "sar": {
          "name": "SAR-5.56",
          "cost": 95000,
          "weight": 5,
          "dura": 18,
          "minLvl": 17,
          "damage": "16-18",
          "precision": 70,
          "range": 12,
          "shots": 12,
          "shop": "gos"
        },
        "cz_sa": {
          "name": "CZ SA Vz.58",
          "cost": 90000,
          "weight": 5,
          "dura": 20,
          "minLvl": 18,
          "damage": "14-20",
          "precision": 75,
          "range": 12,
          "shots": 12,
          "shop": "gos"
        },
        "g3": {
          "name": "Винтовка G3",
          "cost": 95000,
          "weight": 6,
          "dura": 20,
          "minLvl": 19,
          "damage": "17-27",
          "precision": 60,
          "range": 10,
          "shots": 10,
          "shop": "gos"
        },
        "fara83": {
          "name": "FARA 83",
          "cost": 100000,
          "weight": 6,
          "dura": 22,
          "minLvl": 20,
          "damage": "16-22",
          "precision": 70,
          "range": 12,
          "shots": 12,
          "shop": "gos"
        },
        "g3aa": {
          "name": "G3-AA",
          "cost": 110000,
          "weight": 6,
          "dura": 21,
          "minLvl": 21,
          "damage": "28-35",
          "precision": 65,
          "range": 10,
          "shots": 7,
          "shop": "gos"
        },
        "arx160": {
          "name": "Beretta ARX-160",
          "cost": 110000,
          "weight": 6,
          "dura": 23,
          "minLvl": 23,
          "damage": "21-27",
          "precision": 75,
          "range": 12,
          "shots": 10,
          "shop": "gos"
        },
        "sr88": {
          "name": "CIS SR-88",
          "cost": 120000,
          "weight": 6,
          "dura": 23,
          "minLvl": 24,
          "damage": "16-22",
          "precision": 70,
          "range": 12,
          "shots": 15,
          "shop": "gos"
        },
        "fnfal": {
          "name": "FN-FAL",
          "cost": 140000,
          "weight": 7,
          "dura": 24,
          "minLvl": 25,
          "damage": "17-25",
          "precision": 70,
          "range": 12,
          "shots": 15,
          "shop": "gos"
        },
        "m82": {
          "name": "M-82 Valmet",
          "cost": 152000,
          "weight": 8,
          "dura": 25,
          "minLvl": 29,
          "damage": "18-26",
          "precision": 80,
          "range": 13,
          "shots": 15,
          "shop": "gos"
        },
        "fs2000": {
          "name": "Винтовка FS2000",
          "cost": 203000,
          "weight": 8,
          "dura": 28,
          "minLvl": 31,
          "damage": "20-26",
          "precision": 80,
          "range": 14,
          "shots": 15,
          "shop": "gos"
        },
        "fnscar": {
          "name": "FN SCAR Mk.16",
          "cost": 255000,
          "weight": 8,
          "dura": 30,
          "minLvl": 33,
          "damage": "20-30",
          "precision": 80,
          "range": 15,
          "shots": 15,
          "shop": "gos"
        },
        "aps95": {
          "name": "APS 95",
          "cost": 250000,
          "weight": 8,
          "dura": 30,
          "minLvl": 35,
          "damage": "20-26",
          "precision": 80,
          "range": 16,
          "shots": 15,
          "shop": "gos"
        },
        "bofors": {
          "name": "Bofors AK-5",
          "cost": 240000,
          "weight": 8,
          "dura": 30,
          "minLvl": 36,
          "damage": "20-27",
          "precision": 80,
          "range": 16,
          "shots": 16,
          "shop": "gos"
        },
        "m17s": {
          "name": "Bushmaster M17s",
          "cost": 220000,
          "weight": 9,
          "dura": 30,
          "minLvl": 38,
          "damage": "22-29",
          "precision": 80,
          "range": 18,
          "shots": 15,
          "shop": "gos"
        },
        "hk417": {
          "name": "HK 417",
          "cost": 210000,
          "weight": 9,
          "dura": 30,
          "minLvl": 39,
          "damage": "22-30",
          "precision": 80,
          "range": 20,
          "shots": 15,
          "shop": "gos"
        },
        "vektor": {
          "name": "Vektor R4",
          "cost": 280000,
          "weight": 9,
          "dura": 30,
          "minLvl": 41,
          "damage": "26-34",
          "precision": 80,
          "range": 22,
          "shots": 16,
          "shop": "gos"
        },
        "tiger": {
          "name": "S2 Tiger",
          "cost": 250000,
          "weight": 8,
          "dura": 30,
          "minLvl": 43,
          "damage": "28-36",
          "precision": 80,
          "range": 24,
          "shots": 16,
          "shop": "gos"
        },
        "hk762": {
          "name": "HK MR762",
          "cost": 240000,
          "weight": 8,
          "dura": 35,
          "minLvl": 44,
          "damage": "23-30",
          "precision": 80,
          "range": 21,
          "shots": 15,
          "shop": "gos"
        },
        "enfield80": {
          "name": "Enfield SA-80",
          "cost": 235000,
          "weight": 9,
          "dura": 30,
          "minLvl": 45,
          "damage": "30-38",
          "precision": 80,
          "range": 26,
          "shots": 16,
          "shop": "gos"
        },
        "g11": {
          "name": "Винтовка G-11",
          "cost": 8,
          "weight": 2,
          "dura": 50,
          "minLvl": 7,
          "damage": "13-17",
          "precision": 70,
          "range": 4,
          "shots": 10,
          "shop": "art"
        },
        "oicw": {
          "name": "OICW 5.56",
          "cost": 9,
          "weight": 2,
          "dura": 60,
          "minLvl": 7,
          "damage": "10-15",
          "precision": 80,
          "range": 6,
          "shots": 10,
          "shop": "art"
        },
        "an94": {
          "name": "АН-94",
          "cost": 25,
          "weight": 4,
          "dura": 70,
          "minLvl": 15,
          "damage": "18-20",
          "precision": 80,
          "range": 10,
          "shots": 12,
          "shop": "art"
        },
        "f2000": {
          "name": "Винтовка F2000",
          "cost": 45,
          "weight": 4,
          "dura": 80,
          "minLvl": 16,
          "damage": "22-30",
          "precision": 85,
          "range": 12,
          "shots": 10,
          "shop": "art"
        },
        "fnfnc": {
          "name": "FN FNC",
          "cost": 45,
          "weight": 4,
          "dura": 60,
          "minLvl": 19,
          "damage": "21-27",
          "precision": 70,
          "range": 13,
          "shots": 14,
          "shop": "art"
        },
        "hk_416": {
          "name": "HK416",
          "cost": 50,
          "weight": 5,
          "dura": 60,
          "minLvl": 20,
          "damage": "19-25",
          "precision": 75,
          "range": 14,
          "shots": 15,
          "shop": "art"
        },
        "groza": {
          "name": "Гроза-1",
          "cost": 55,
          "weight": 5,
          "dura": 60,
          "minLvl": 22,
          "damage": "20-30",
          "precision": 80,
          "range": 14,
          "shots": 15,
          "shop": "art"
        },
        "ka90": {
          "name": "KA-90",
          "cost": 60,
          "weight": 8,
          "dura": 62,
          "minLvl": 25,
          "damage": "22-32",
          "precision": 80,
          "range": 15,
          "shots": 14,
          "shop": "art"
        },
        "taiga": {
          "name": "АБ-762 Тайга",
          "cost": 64,
          "weight": 8,
          "dura": 63,
          "minLvl": 28,
          "damage": "25-37",
          "precision": 80,
          "range": 16,
          "shots": 13,
          "shop": "art"
        },
        "xcr": {
          "name": "XCR 5.56",
          "cost": 64,
          "weight": 8,
          "dura": 60,
          "minLvl": 30,
          "damage": "30-38",
          "precision": 80,
          "range": 17,
          "shots": 12,
          "shop": "art"
        },
        "tkb517": {
          "name": "ТКБ-517",
          "cost": 67,
          "weight": 8,
          "dura": 60,
          "minLvl": 34,
          "damage": "33-43",
          "precision": 80,
          "range": 18,
          "shots": 11,
          "shop": "art"
        },
        "steyr_a3": {
          "name": "Steyr A3",
          "cost": 65,
          "weight": 8,
          "dura": 60,
          "minLvl": 35,
          "damage": "25-35",
          "precision": 80,
          "range": 20,
          "shots": 12,
          "shop": "art"
        },
        "ak103": {
          "name": "AK-103",
          "cost": 65,
          "weight": 8,
          "dura": 60,
          "minLvl": 36,
          "damage": "24-36",
          "precision": 80,
          "range": 20,
          "shots": 14,
          "shop": "art"
        },
        "g36": {
          "name": "HK G36",
          "cost": 70,
          "weight": 8,
          "dura": 50,
          "minLvl": 38,
          "damage": "26-38",
          "precision": 80,
          "range": 22,
          "shots": 13,
          "shop": "art"
        },
        "g41": {
          "name": "HK G41",
          "cost": 75,
          "weight": 9,
          "dura": 50,
          "minLvl": 39,
          "damage": "23-38",
          "precision": 80,
          "range": 24,
          "shots": 14,
          "shop": "art"
        },
        "sig552": {
          "name": "SG-552 SWAT",
          "cost": 75,
          "weight": 8,
          "dura": 50,
          "minLvl": 41,
          "damage": "32-40",
          "precision": 80,
          "range": 26,
          "shots": 15,
          "shop": "art"
        },
        "ace": {
          "name": "Galil ACE",
          "cost": 75,
          "weight": 8,
          "dura": 50,
          "minLvl": 43,
          "damage": "30-42",
          "precision": 80,
          "range": 28,
          "shots": 15,
          "shop": "art"
        },
        "colt692": {
          "name": "Colt 692 \"SpecOps\"",
          "cost": 75,
          "weight": 8,
          "dura": 55,
          "minLvl": 44,
          "damage": "26-39",
          "precision": 80,
          "range": 24,
          "shots": 14,
          "shop": "art"
        },
        "thales": {
          "name": "Thales F90",
          "cost": 70,
          "weight": 9,
          "dura": 55,
          "minLvl": 45,
          "damage": "32-43",
          "precision": 80,
          "range": 30,
          "shots": 16,
          "shop": "art"
        },
        "thales_grl": {
          "name": "Thales F90 Launcher",
          "cost": 70,
          "weight": 9,
          "dura": 55,
          "minLvl": 46,
          "damage": "36-45",
          "precision": 80,
          "range": 30,
          "shots": 15,
          "area": 1,
          "shop": "art"
        },
        "colt_extreme1": {
          "name": "Colt M4 Extreme",
          "cost": 10,
          "weight": 5,
          "dura": 5000,
          "minLvl": 15,
          "damage": "33-43",
          "precision": 85,
          "range": 26,
          "shots": 20,
          "shop": "rent"
        },
        "colt_extreme": {
          "name": "Colt M4 Extreme",
          "cost": 48,
          "weight": 5,
          "dura": 5000,
          "minLvl": 15,
          "damage": "33-43",
          "precision": 85,
          "range": 26,
          "shots": 20,
          "shop": "rent"
        },
        "lr300": {
          "name": "LR-300 5.56",
          "cost": 54,
          "weight": 5,
          "dura": 5000,
          "minLvl": 25,
          "damage": "33-43",
          "precision": 85,
          "range": 30,
          "shots": 17,
          "shop": "rent"
        },
        "sig750": {
          "name": "SIG SG 750",
          "cost": 65,
          "weight": 5,
          "dura": 5000,
          "minLvl": 38,
          "damage": "35-45",
          "precision": 85,
          "range": 34,
          "shots": 17,
          "shop": "rent"
        }
      },
      "sniper": {
        "svdmini": {
          "name": "Снайперская винтовка",
          "cost": 800,
          "weight": 6,
          "dura": 20,
          "minLvl": 0,
          "damage": "18-24",
          "precision": 100,
          "range": 4,
          "shots": 1,
          "shop": "gos"
        },
        "l96": {
          "name": "L96 A1",
          "cost": 18000,
          "weight": 4,
          "dura": 15,
          "minLvl": 6,
          "damage": "15-25",
          "precision": 100,
          "range": 8,
          "shots": 1,
          "shop": "gos"
        },
        "149s": {
          "name": "Vapensmia 149-F1",
          "cost": 17000,
          "weight": 4,
          "dura": 20,
          "minLvl": 8,
          "damage": "15-25",
          "precision": 100,
          "range": 8,
          "shots": 1,
          "shop": "gos"
        },
        "cz527": {
          "name": "CZ 527 Varmint",
          "cost": 18200,
          "weight": 4,
          "dura": 20,
          "minLvl": 9,
          "damage": "20-30",
          "precision": 100,
          "range": 10,
          "shots": 1,
          "shop": "gos"
        },
        "m40": {
          "name": "Винтовка M40",
          "cost": 25000,
          "weight": 4,
          "dura": 20,
          "minLvl": 10,
          "damage": "20-30",
          "precision": 100,
          "range": 12,
          "shots": 1,
          "shop": "gos"
        },
        "police": {
          "name": "Police Rifle",
          "cost": 36000,
          "weight": 4,
          "dura": 20,
          "minLvl": 11,
          "damage": "40-50",
          "precision": 100,
          "range": 14,
          "shots": 1,
          "shop": "gos"
        },
        "mauser": {
          "name": "Mauser M-86",
          "cost": 42000,
          "weight": 4,
          "dura": 20,
          "minLvl": 11,
          "damage": "45-55",
          "precision": 100,
          "range": 12,
          "shots": 1,
          "shop": "gos"
        },
        "remington700": {
          "name": "Remington 700 VTR",
          "cost": 55000,
          "weight": 4,
          "dura": 20,
          "minLvl": 13,
          "damage": "35-45",
          "precision": 100,
          "range": 14,
          "shots": 1,
          "shop": "gos"
        },
        "psg": {
          "name": "PSG-1",
          "cost": 60000,
          "weight": 4,
          "dura": 22,
          "minLvl": 14,
          "damage": "40-55",
          "precision": 100,
          "range": 15,
          "shots": 1,
          "shop": "gos"
        },
        "ssg": {
          "name": "SSG 550",
          "cost": 65000,
          "weight": 4,
          "dura": 20,
          "minLvl": 14,
          "damage": "50-55",
          "precision": 100,
          "range": 14,
          "shots": 1,
          "shop": "gos"
        },
        "m76": {
          "name": "M-76",
          "cost": 67000,
          "weight": 4,
          "dura": 24,
          "minLvl": 15,
          "damage": "35-45",
          "precision": 100,
          "range": 16,
          "shots": 1,
          "shop": "gos"
        },
        "svd": {
          "name": "СВД",
          "cost": 90000,
          "weight": 4,
          "dura": 24,
          "minLvl": 16,
          "damage": "55-60",
          "precision": 100,
          "range": 16,
          "shots": 1,
          "shop": "gos"
        },
        "om50": {
          "name": "OM50 Nemesis",
          "cost": 81000,
          "weight": 4,
          "dura": 24,
          "minLvl": 17,
          "damage": "55-65",
          "precision": 100,
          "range": 16,
          "shots": 1,
          "shop": "gos"
        },
        "ssg2000": {
          "name": "SSG 2000",
          "cost": 90000,
          "weight": 3,
          "dura": 20,
          "minLvl": 18,
          "damage": "55-65",
          "precision": 100,
          "range": 16,
          "shots": 1,
          "shop": "gos"
        },
        "b94": {
          "name": "B-94",
          "cost": 120000,
          "weight": 3,
          "dura": 20,
          "minLvl": 19,
          "damage": "65-70",
          "precision": 100,
          "range": 15,
          "shots": 1,
          "shop": "gos"
        },
        "ssg3000": {
          "name": "SSG 3000 Black",
          "cost": 110000,
          "weight": 5,
          "dura": 20,
          "minLvl": 20,
          "damage": "62-72",
          "precision": 100,
          "range": 18,
          "shots": 1,
          "shop": "gos"
        },
        "falcon": {
          "name": "Falcon",
          "cost": 125000,
          "weight": 3,
          "dura": 22,
          "minLvl": 21,
          "damage": "85-95",
          "precision": 100,
          "range": 16,
          "shots": 1,
          "shop": "gos"
        },
        "f2": {
          "name": "FR-F2",
          "cost": 130000,
          "weight": 5,
          "dura": 22,
          "minLvl": 23,
          "damage": "70-80",
          "precision": 100,
          "range": 18,
          "shots": 1,
          "shop": "gos"
        },
        "m24": {
          "name": "M-24 Light",
          "cost": 150000,
          "weight": 4,
          "dura": 20,
          "minLvl": 25,
          "damage": "80-90",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "gos"
        },
        "savage10fp": {
          "name": "Savage 10FP",
          "cost": 182000,
          "weight": 6,
          "dura": 23,
          "minLvl": 28,
          "damage": "100-110",
          "precision": 100,
          "range": 18,
          "shots": 1,
          "shop": "gos"
        },
        "steyr_iws": {
          "name": "Steyr IWS-2007",
          "cost": 201000,
          "weight": 6,
          "dura": 24,
          "minLvl": 30,
          "damage": "103-112",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "gos"
        },
        "ulr338": {
          "name": "Noreen ULR .338",
          "cost": 210000,
          "weight": 6,
          "dura": 24,
          "minLvl": 33,
          "damage": "100-115",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "gos"
        },
        "savage100fp": {
          "name": "Savage 100FP",
          "cost": 221000,
          "weight": 6,
          "dura": 25,
          "minLvl": 35,
          "damage": "105-115",
          "precision": 100,
          "range": 22,
          "shots": 1,
          "shop": "gos"
        },
        "tikka": {
          "name": "Tikka T3 Tactical",
          "cost": 248000,
          "weight": 8,
          "dura": 25,
          "minLvl": 38,
          "damage": "110-120",
          "precision": 100,
          "range": 24,
          "shots": 1,
          "shop": "gos"
        },
        "cz700": {
          "name": "CZ 700 M1",
          "cost": 261000,
          "weight": 8,
          "dura": 25,
          "minLvl": 40,
          "damage": "115-130",
          "precision": 100,
          "range": 26,
          "shots": 1,
          "shop": "gos"
        },
        "bora": {
          "name": "Bora JNG-90",
          "cost": 250000,
          "weight": 7,
          "dura": 25,
          "minLvl": 41,
          "damage": "68-78",
          "precision": 100,
          "range": 26,
          "shots": 2,
          "shop": "gos"
        },
        "ksv": {
          "name": "Keppeler KS-V",
          "cost": 275000,
          "weight": 8,
          "dura": 25,
          "minLvl": 43,
          "damage": "120-140",
          "precision": 100,
          "range": 28,
          "shots": 1,
          "shop": "gos"
        },
        "fd308": {
          "name": "F&D Defence .308",
          "cost": 250000,
          "weight": 8,
          "dura": 30,
          "minLvl": 44,
          "damage": "112-120",
          "precision": 100,
          "range": 25,
          "shots": 1,
          "shop": "gos"
        },
        "r11": {
          "name": "Remington R11",
          "cost": 220000,
          "weight": 8,
          "dura": 30,
          "minLvl": 45,
          "damage": "130-160",
          "precision": 100,
          "range": 28,
          "shots": 1,
          "shop": "gos"
        },
        "bor762": {
          "name": "Bor 7.62",
          "cost": 250000,
          "weight": 7,
          "dura": 28,
          "minLvl": 46,
          "damage": "75-90",
          "precision": 100,
          "range": 30,
          "shots": 2,
          "shop": "gos"
        }
      },
      "ppguns": {
        "uzi": {
          "name": "ПП Узи",
          "cost": 12000,
          "weight": 1,
          "dura": 13,
          "slots": ["lh", "rh"],
          "minLvl": 0,
          "damage": "2-10",
          "precision": 12,
          "range": 0,
          "shots": 10,
          "shop": "gos"
        },
        "calico": {
          "name": "Calico M960",
          "cost": 14000,
          "weight": 1,
          "dura": 15,
          "slots": ["lh", "rh"],
          "minLvl": 5,
          "damage": "5-11",
          "precision": 30,
          "range": 0,
          "shots": 5,
          "shop": "gos"
        },
        "lf57": {
          "name": "LF-57",
          "cost": 16000,
          "weight": 1,
          "dura": 18,
          "slots": ["lh", "rh"],
          "minLvl": 7,
          "damage": "8-15",
          "precision": 30,
          "range": 1,
          "shots": 5,
          "shop": "gos"
        },
        "ump": {
          "name": "UMP",
          "cost": 18000,
          "weight": 2,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 9,
          "damage": "8-15",
          "precision": 20,
          "range": 0,
          "shots": 10,
          "shop": "gos"
        },
        "gg95": {
          "name": "GG-95",
          "cost": 23000,
          "weight": 2,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 11,
          "damage": "15-21",
          "precision": 30,
          "range": 3,
          "shots": 5,
          "shop": "gos"
        },
        "m4": {
          "name": "M-4 Спектр",
          "cost": 40000,
          "weight": 2,
          "dura": 22,
          "slots": ["lh", "rh"],
          "minLvl": 12,
          "damage": "18-25",
          "precision": 50,
          "range": 4,
          "shots": 3,
          "shop": "gos"
        },
        "mas38": {
          "name": "MAS-38",
          "cost": 28000,
          "weight": 2,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 14,
          "damage": "20-27",
          "precision": 50,
          "range": 4,
          "shots": 3,
          "shop": "gos"
        },
        "kashtan": {
          "name": "ПП Каштан",
          "cost": 45000,
          "weight": 2,
          "dura": 18,
          "slots": ["lh", "rh"],
          "minLvl": 16,
          "damage": "30-38",
          "precision": 50,
          "range": 8,
          "shots": 3,
          "shop": "gos"
        },
        "suomi": {
          "name": "Suomi M-1931",
          "cost": 47000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 17,
          "damage": "34-39",
          "precision": 50,
          "range": 8,
          "shots": 3,
          "shop": "gos"
        },
        "ingram": {
          "name": "Ingram M6",
          "cost": 50000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 18,
          "damage": "37-43",
          "precision": 50,
          "range": 8,
          "shots": 3,
          "shop": "gos"
        },
        "colt": {
          "name": "Colt 633",
          "cost": 55000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 19,
          "damage": "30-38",
          "precision": 70,
          "range": 8,
          "shots": 3,
          "shop": "gos"
        },
        "walther": {
          "name": "Walther MPL",
          "cost": 50000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 20,
          "damage": "44-53",
          "precision": 50,
          "range": 10,
          "shots": 3,
          "shop": "gos"
        },
        "fmk3": {
          "name": "FMK-3",
          "cost": 60000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 21,
          "damage": "48-53",
          "precision": 50,
          "range": 10,
          "shots": 3,
          "shop": "gos"
        },
        "vihr": {
          "name": "ПП Вихрь",
          "cost": 65000,
          "weight": 3,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 22,
          "damage": "40-45",
          "precision": 60,
          "range": 10,
          "shots": 3,
          "shop": "gos"
        },
        "saf": {
          "name": "S.A.F",
          "cost": 70000,
          "weight": 5,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 23,
          "damage": "54-59",
          "precision": 50,
          "range": 7,
          "shots": 3,
          "shop": "gos"
        },
        "mpi81": {
          "name": "Steyr Mpi 81",
          "cost": 67000,
          "weight": 4,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 24,
          "damage": "50-56",
          "precision": 50,
          "range": 10,
          "shots": 3,
          "shop": "gos"
        },
        "agram": {
          "name": "Agram 2000",
          "cost": 70000,
          "weight": 4,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 28,
          "damage": "46-54",
          "precision": 50,
          "range": 12,
          "shots": 3,
          "shop": "gos"
        },
        "bizon": {
          "name": "ПП-19 Бизон",
          "cost": 75000,
          "weight": 4,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 32,
          "damage": "40-50",
          "precision": 60,
          "range": 14,
          "shots": 3,
          "shop": "gos"
        },
        "kedr": {
          "name": "ПП Кедр",
          "cost": 85000,
          "weight": 4,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 36,
          "damage": "55-60",
          "precision": 60,
          "range": 16,
          "shots": 3,
          "shop": "gos"
        },
        "colt636": {
          "name": "Colt m636",
          "cost": 90000,
          "weight": 4,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 38,
          "damage": "45-65",
          "precision": 50,
          "range": 20,
          "shots": 3,
          "shop": "gos"
        },
        "scorpionevo": {
          "name": "Scorpion EVO",
          "cost": 100000,
          "weight": 4,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 41,
          "damage": "40-48",
          "precision": 60,
          "range": 22,
          "shots": 4,
          "shop": "gos"
        },
        "berettamx4": {
          "name": "Beretta MX4",
          "cost": 120000,
          "weight": 6,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 43,
          "damage": "43-50",
          "precision": 60,
          "range": 24,
          "shots": 4,
          "shop": "gos"
        },
        "fmg9": {
          "name": "FMG-9",
          "cost": 115000,
          "weight": 6,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 45,
          "damage": "47-52",
          "precision": 50,
          "range": 26,
          "shots": 4,
          "shop": "gos"
        },
        "mp5": {
          "name": "MP-5",
          "cost": 12,
          "weight": 2,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 11,
          "damage": "23-27",
          "precision": 60,
          "range": 4,
          "shots": 3,
          "shop": "art"
        },
        "berettam12": {
          "name": "Beretta M12",
          "cost": 18,
          "weight": 2,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 18,
          "damage": "50-57",
          "precision": 50,
          "range": 10,
          "shots": 3,
          "shop": "art"
        },
        "scorpion": {
          "name": "Scorpion",
          "cost": 20,
          "weight": 3,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 20,
          "damage": "45-50",
          "precision": 50,
          "range": 12,
          "shots": 3,
          "shop": "art"
        },
        "stkinetics": {
          "name": "Kinetics CPW",
          "cost": 25,
          "weight": 3,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 22,
          "damage": "55-62",
          "precision": 50,
          "range": 10,
          "shots": 3,
          "shop": "art"
        },
        "p90": {
          "name": "P-90",
          "cost": 30,
          "weight": 3,
          "dura": 60,
          "slots": ["lh", "rh"],
          "minLvl": 25,
          "damage": "54-60",
          "precision": 50,
          "range": 12,
          "shots": 3,
          "shop": "art"
        },
        "90m1": {
          "name": "ПП-90М1",
          "cost": 35,
          "weight": 3,
          "dura": 62,
          "slots": ["lh", "rh"],
          "minLvl": 30,
          "damage": "50-62",
          "precision": 50,
          "range": 13,
          "shots": 3,
          "shop": "art"
        },
        "mp7": {
          "name": "HK MP-7",
          "cost": 40,
          "weight": 4,
          "dura": 60,
          "slots": ["lh", "rh"],
          "minLvl": 35,
          "damage": "60-65",
          "precision": 50,
          "range": 15,
          "shots": 3,
          "shop": "art"
        },
        "kriss2": {
          "name": "TDI Kriss V2",
          "cost": 40,
          "weight": 4,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 39,
          "damage": "50-70",
          "precision": 50,
          "range": 22,
          "shots": 3,
          "shop": "art"
        },
        "mtar21": {
          "name": "MTAR-21",
          "cost": 35,
          "weight": 4,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 41,
          "damage": "42-55",
          "precision": 50,
          "range": 24,
          "shots": 4,
          "shop": "art"
        },
        "pm06": {
          "name": "PM-06",
          "cost": 35,
          "weight": 5,
          "dura": 50,
          "slots": ["lh", "rh"],
          "minLvl": 43,
          "damage": "56-66",
          "precision": 50,
          "range": 26,
          "shots": 4,
          "shop": "art"
        },
        "uzipro": {
          "name": "Uzi Pro",
          "cost": 32,
          "weight": 5,
          "dura": 55,
          "slots": ["lh", "rh"],
          "minLvl": 45,
          "damage": "60-68",
          "precision": 50,
          "range": 28,
          "shots": 4,
          "shop": "art"
        }
      },
      "heavy": {
        "fn_min": {
          "name": "FN-Minimi",
          "cost": 20500,
          "weight": 7,
          "dura": 10,
          "minLvl": 5,
          "damage": "3-7",
          "precision": 15,
          "range": 1,
          "shots": 35,
          "shop": "gos"
        },
        "lewis": {
          "name": "Lewis MG",
          "cost": 15000,
          "weight": 5,
          "dura": 15,
          "minLvl": 7,
          "damage": "1-7",
          "precision": 31,
          "range": 2,
          "shots": 40,
          "shop": "gos"
        },
        "type95": {
          "name": "Type 95 MG",
          "cost": 18300,
          "weight": 6,
          "dura": 20,
          "minLvl": 9,
          "damage": "3-9",
          "precision": 38,
          "range": 2,
          "shots": 40,
          "shop": "gos"
        },
        "fnmag": {
          "name": "Пулемёт FN MAG",
          "cost": 40000,
          "weight": 6,
          "dura": 20,
          "minLvl": 11,
          "damage": "10-15",
          "precision": 30,
          "range": 4,
          "shots": 40,
          "shop": "gos"
        },
        "bren": {
          "name": "Брен L4",
          "cost": 35000,
          "weight": 6,
          "dura": 16,
          "minLvl": 11,
          "damage": "9-13",
          "precision": 35,
          "range": 6,
          "shots": 35,
          "shop": "gos"
        },
        "l86": {
          "name": "LSW L-86",
          "cost": 55000,
          "weight": 7,
          "dura": 20,
          "minLvl": 12,
          "damage": "12-17",
          "precision": 40,
          "range": 4,
          "shots": 35,
          "shop": "gos"
        },
        "m16a2": {
          "name": "M16A2 Heavy Gun",
          "cost": 50000,
          "weight": 6,
          "dura": 15,
          "minLvl": 13,
          "damage": "14-20",
          "precision": 35,
          "range": 6,
          "shots": 35,
          "shop": "gos"
        },
        "mg3": {
          "name": "Пулемёт MG-3",
          "cost": 80000,
          "weight": 8,
          "dura": 20,
          "minLvl": 14,
          "damage": "12-15",
          "precision": 40,
          "range": 6,
          "shots": 40,
          "shop": "gos"
        },
        "type62": {
          "name": "Rising Sun T62",
          "cost": 75000,
          "weight": 6,
          "dura": 20,
          "minLvl": 15,
          "damage": "15-21",
          "precision": 40,
          "range": 6,
          "shots": 29,
          "shop": "gos"
        },
        "ar70": {
          "name": "AR70/84 \"Beretta\"",
          "cost": 83000,
          "weight": 6,
          "dura": 20,
          "minLvl": 17,
          "damage": "12-18",
          "precision": 33,
          "range": 6,
          "shots": 45,
          "shop": "gos"
        },
        "p41": {
          "name": "Печенег",
          "cost": 70000,
          "weight": 7,
          "dura": 18,
          "minLvl": 18,
          "damage": "13-17",
          "precision": 40,
          "range": 6,
          "shots": 40,
          "shop": "gos"
        },
        "saw": {
          "name": "M249 SAW",
          "cost": 90000,
          "weight": 7,
          "dura": 20,
          "minLvl": 19,
          "damage": "14-19",
          "precision": 40,
          "range": 6,
          "shots": 35,
          "shop": "gos"
        },
        "zb53": {
          "name": "пулемет ZB 53",
          "cost": 90000,
          "weight": 6,
          "dura": 20,
          "minLvl": 20,
          "damage": "17-23",
          "precision": 33,
          "range": 7,
          "shots": 35,
          "shop": "gos"
        },
        "nsv": {
          "name": "НСВ",
          "cost": 90000,
          "weight": 8,
          "dura": 22,
          "minLvl": 21,
          "damage": "15-21",
          "precision": 36,
          "range": 6,
          "shots": 40,
          "shop": "gos"
        },
        "type67": {
          "name": "Type 67 HMG",
          "cost": 110000,
          "weight": 7,
          "dura": 23,
          "minLvl": 22,
          "damage": "11-17",
          "precision": 40,
          "range": 7,
          "shots": 40,
          "shop": "gos"
        },
        "galil": {
          "name": "АRM \"Галил\"",
          "cost": 100000,
          "weight": 6,
          "dura": 20,
          "minLvl": 23,
          "damage": "17-23",
          "precision": 36,
          "range": 7,
          "shots": 30,
          "shop": "gos"
        },
        "sig710": {
          "name": "SIG MG 710",
          "cost": 120000,
          "weight": 6,
          "dura": 23,
          "minLvl": 24,
          "damage": "10-16",
          "precision": 40,
          "range": 8,
          "shots": 40,
          "shop": "gos"
        },
        "m60": {
          "name": "M-60",
          "cost": 130000,
          "weight": 8,
          "dura": 20,
          "minLvl": 25,
          "damage": "15-20",
          "precision": 35,
          "range": 8,
          "shots": 37,
          "shop": "gos"
        },
        "vickers": {
          "name": "Vickers MG Light",
          "cost": 205000,
          "weight": 11,
          "dura": 25,
          "minLvl": 28,
          "damage": "16-19",
          "precision": 35,
          "range": 10,
          "shots": 38,
          "shop": "gos"
        },
        "vz59": {
          "name": "VZ-59 Heavy Gun",
          "cost": 240000,
          "weight": 12,
          "dura": 27,
          "minLvl": 32,
          "damage": "15-21",
          "precision": 35,
          "range": 12,
          "shots": 39,
          "shop": "gos"
        },
        "mg4": {
          "name": "Пулемёт HK MG-4",
          "cost": 250000,
          "weight": 12,
          "dura": 28,
          "minLvl": 33,
          "damage": "15-23",
          "precision": 35,
          "range": 12,
          "shots": 38,
          "shop": "gos"
        },
        "mg36": {
          "name": "HK MG-36",
          "cost": 300000,
          "weight": 13,
          "dura": 30,
          "minLvl": 35,
          "damage": "16-24",
          "precision": 35,
          "range": 12,
          "shots": 37,
          "shop": "gos"
        },
        "m61": {
          "name": "M-61 Volcano",
          "cost": 280000,
          "weight": 13,
          "dura": 30,
          "minLvl": 36,
          "damage": "18-25",
          "precision": 35,
          "range": 14,
          "shots": 35,
          "shop": "gos"
        },
        "aat": {
          "name": "AAT m.52",
          "cost": 290000,
          "weight": 14,
          "dura": 30,
          "minLvl": 37,
          "damage": "18-24",
          "precision": 35,
          "range": 14,
          "shots": 37,
          "shop": "gos"
        },
        "xm312": {
          "name": "XM-312",
          "cost": 250000,
          "weight": 14,
          "dura": 30,
          "minLvl": 39,
          "damage": "18-24",
          "precision": 35,
          "range": 16,
          "shots": 40,
          "shop": "gos"
        },
        "sturm": {
          "name": "MG-45 Sturm",
          "cost": 220000,
          "weight": 13,
          "dura": 30,
          "minLvl": 41,
          "damage": "15-24",
          "precision": 35,
          "range": 18,
          "shots": 43,
          "shop": "gos"
        },
        "venom": {
          "name": "mk48 Venom",
          "cost": 250000,
          "weight": 14,
          "dura": 30,
          "minLvl": 43,
          "damage": "20-25",
          "precision": 33,
          "range": 20,
          "shots": 36,
          "shop": "gos"
        },
        "fort401": {
          "name": "Форт-401",
          "cost": 250000,
          "weight": 13,
          "dura": 35,
          "minLvl": 44,
          "damage": "19-25",
          "precision": 35,
          "range": 16,
          "shots": 39,
          "shop": "gos"
        },
        "vektorss77": {
          "name": "Vektor SS-77",
          "cost": 230000,
          "weight": 15,
          "dura": 30,
          "minLvl": 45,
          "damage": "22-26",
          "precision": 33,
          "range": 22,
          "shots": 40,
          "shop": "gos"
        },
        "pkp": {
          "name": "ПК 7,62",
          "cost": 18,
          "weight": 6,
          "dura": 60,
          "minLvl": 11,
          "damage": "12-17",
          "precision": 35,
          "range": 6,
          "shots": 45,
          "shop": "art"
        },
        "ameli": {
          "name": "Амели",
          "cost": 30,
          "weight": 5,
          "dura": 70,
          "minLvl": 15,
          "damage": "14-20",
          "precision": 40,
          "range": 8,
          "shots": 30,
          "shop": "art"
        },
        "hk21": {
          "name": "HK-21 Wiper",
          "cost": 45,
          "weight": 6,
          "dura": 80,
          "minLvl": 16,
          "damage": "15-22",
          "precision": 33,
          "range": 8,
          "shots": 35,
          "shop": "art"
        },
        "rpk74": {
          "name": "РПК",
          "cost": 55,
          "weight": 7,
          "dura": 60,
          "minLvl": 22,
          "damage": "16-22",
          "precision": 35,
          "range": 10,
          "shots": 40,
          "shop": "art"
        },
        "pkm": {
          "name": "ПКМ",
          "cost": 45,
          "weight": 6,
          "dura": 60,
          "minLvl": 18,
          "damage": "17-23",
          "precision": 35,
          "range": 9,
          "shots": 35,
          "shop": "art"
        },
        "m16lmg": {
          "name": "Colt M16 LMG",
          "cost": 50,
          "weight": 6,
          "dura": 60,
          "minLvl": 20,
          "damage": "18-24",
          "precision": 30,
          "range": 10,
          "shots": 35,
          "shop": "art"
        },
        "aa52": {
          "name": "АА-52 Attaque",
          "cost": 55,
          "weight": 10,
          "dura": 58,
          "minLvl": 25,
          "damage": "18-23",
          "precision": 35,
          "range": 11,
          "shots": 38,
          "shop": "art"
        },
        "mg43": {
          "name": "HK MG-43",
          "cost": 64,
          "weight": 10,
          "dura": 60,
          "minLvl": 28,
          "damage": "17-26",
          "precision": 35,
          "range": 13,
          "shots": 37,
          "shop": "art"
        },
        "pssg": {
          "name": "ПССГ",
          "cost": 66,
          "weight": 10,
          "dura": 62,
          "minLvl": 30,
          "damage": "19-27",
          "precision": 35,
          "range": 14,
          "shots": 36,
          "shop": "art"
        },
        "ares16": {
          "name": "Ares 16 AMG",
          "cost": 68,
          "weight": 8,
          "dura": 60,
          "minLvl": 33,
          "damage": "19-28",
          "precision": 35,
          "range": 14,
          "shots": 35,
          "shop": "art"
        },
        "spitfire": {
          "name": "FN BRG-17 Spitfire",
          "cost": 70,
          "weight": 11,
          "dura": 62,
          "minLvl": 34,
          "damage": "20-29",
          "precision": 35,
          "range": 15,
          "shots": 35,
          "shop": "art"
        },
        "pkms": {
          "name": "ПКМС 7,62",
          "cost": 70,
          "weight": 11,
          "dura": 62,
          "minLvl": 36,
          "damage": "20-27",
          "precision": 35,
          "range": 16,
          "shots": 37,
          "shop": "art"
        },
        "minigun762": {
          "name": "MiniGun 7.62",
          "cost": 76,
          "weight": 12,
          "dura": 50,
          "minLvl": 37,
          "damage": "20-27",
          "precision": 35,
          "range": 18,
          "shots": 38,
          "shop": "art"
        },
        "mg50": {
          "name": "MG-50",
          "cost": 78,
          "weight": 12,
          "dura": 50,
          "minLvl": 39,
          "damage": "20-27",
          "precision": 35,
          "range": 20,
          "shots": 40,
          "shop": "art"
        },
        "ultimax": {
          "name": "Ultimax HMG",
          "cost": 70,
          "weight": 11,
          "dura": 50,
          "minLvl": 41,
          "damage": "19-24",
          "precision": 36,
          "range": 22,
          "shots": 45,
          "shop": "art"
        },
        "shrike": {
          "name": "Ares Shrike 5.56",
          "cost": 70,
          "weight": 12,
          "dura": 50,
          "minLvl": 43,
          "damage": "23-29",
          "precision": 33,
          "range": 24,
          "shots": 35,
          "shop": "art"
        },
        "ng7": {
          "name": "Negev NG7",
          "cost": 78,
          "weight": 11,
          "dura": 55,
          "minLvl": 44,
          "damage": "22-27",
          "precision": 35,
          "range": 20,
          "shots": 40,
          "shop": "art"
        },
        "lwmmg": {
          "name": "LWMMG .338",
          "cost": 69,
          "weight": 13,
          "dura": 55,
          "minLvl": 45,
          "damage": "25-31",
          "precision": 33,
          "range": 26,
          "shots": 40,
          "shop": "art"
        },
        "minigun_heavy1": {
          "name": "Heavy Minigun",
          "cost": 14,
          "weight": 7,
          "dura": 5000,
          "minLvl": 15,
          "damage": "21-31",
          "precision": 33,
          "range": 24,
          "shots": 45,
          "shop": "rent"
        },
        "minigun_heavy": {
          "name": "Heavy Minigun",
          "cost": 50,
          "weight": 7,
          "dura": 5000,
          "minLvl": 15,
          "damage": "21-31",
          "precision": 33,
          "range": 24,
          "shots": 45,
          "shop": "rent"
        },
        "sigmg": {
          "name": "SIG MG-50",
          "cost": 65,
          "weight": 7,
          "dura": 5000,
          "minLvl": 25,
          "damage": "23-33",
          "precision": 33,
          "range": 28,
          "shots": 43,
          "shop": "rent"
        },
        "hk221": {
          "name": "HK-221 «Revenge»",
          "cost": 74,
          "weight": 7,
          "dura": 5000,
          "minLvl": 38,
          "damage": "24-34",
          "precision": 33,
          "range": 32,
          "shots": 44,
          "shop": "rent"
        }
      },
      "shotguns": {
        "winchester1200": {
          "name": "Winchester 1200",
          "cost": 800,
          "weight": 6,
          "dura": 20,
          "minLvl": 0,
          "damage": "12-22",
          "precision": 50,
          "range": 0,
          "shots": 4,
          "shop": "gos"
        },
        "hunter": {
          "name": "Дробовик Hunter",
          "cost": 17500,
          "weight": 2,
          "dura": 10,
          "minLvl": 5,
          "damage": "20-27",
          "precision": 60,
          "range": 0,
          "shots": 2,
          "shop": "gos"
        },
        "remington": {
          "name": "Remington 870",
          "cost": 30000,
          "weight": 2,
          "dura": 20,
          "minLvl": 7,
          "damage": "27-38",
          "precision": 60,
          "range": 2,
          "shots": 2,
          "shop": "gos"
        },
        "sgun2": {
          "name": "Nova Tactical",
          "cost": 38000,
          "weight": 4,
          "dura": 20,
          "minLvl": 9,
          "damage": "45-50",
          "precision": 45,
          "range": 3,
          "shots": 2,
          "shop": "gos"
        },
        "m37": {
          "name": "M-37",
          "cost": 35000,
          "weight": 2,
          "dura": 20,
          "minLvl": 13,
          "damage": "10-30",
          "precision": 50,
          "range": 4,
          "shots": 5,
          "shop": "gos"
        },
        "toz": {
          "name": "ТОЗ-194",
          "cost": 50000,
          "weight": 5,
          "dura": 25,
          "minLvl": 15,
          "damage": "30-40",
          "precision": 80,
          "range": 7,
          "shots": 3,
          "shop": "gos"
        },
        "jackhammer": {
          "name": "Jackhammer",
          "cost": 80000,
          "weight": 2,
          "dura": 20,
          "minLvl": 16,
          "damage": "80-120",
          "precision": 80,
          "range": 1,
          "shots": 2,
          "shop": "gos"
        },
        "spas12": {
          "name": "SPAS 12",
          "cost": 120000,
          "weight": 2,
          "dura": 20,
          "minLvl": 18,
          "damage": "5-10",
          "precision": 30,
          "range": 0,
          "shots": 300,
          "shop": "gos"
        },
        "striker": {
          "name": "Страйкер",
          "cost": 130000,
          "weight": 8,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 20,
          "damage": "70-110",
          "precision": 70,
          "range": 2,
          "shots": 2,
          "shop": "gos"
        },
        "saiga": {
          "name": "Сайга",
          "cost": 70000,
          "weight": 4,
          "dura": 12,
          "minLvl": 22,
          "damage": "15-19",
          "precision": 60,
          "range": 10,
          "shots": 7,
          "shop": "gos"
        },
        "rmb93": {
          "name": "Рысь",
          "cost": 75000,
          "weight": 6,
          "dura": 20,
          "minLvl": 24,
          "damage": "30-90",
          "precision": 100,
          "range": 4,
          "shots": 4,
          "shop": "gos"
        },
        "neostead": {
          "name": "Neostead",
          "cost": 100000,
          "weight": 9,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 26,
          "damage": "40-50",
          "precision": 80,
          "range": 6,
          "shots": 2,
          "shop": "gos"
        },
        "xm26": {
          "name": "XM-26 LSS",
          "cost": 85000,
          "weight": 2,
          "dura": 18,
          "minLvl": 28,
          "damage": "1-7",
          "precision": 30,
          "range": 20,
          "shots": 50,
          "shop": "gos"
        },
        "hawk": {
          "name": "HAWK 97",
          "cost": 90000,
          "weight": 2,
          "dura": 20,
          "slots": ["lh", "rh"],
          "minLvl": 29,
          "damage": "8-14",
          "precision": 30,
          "range": 2,
          "shots": 50,
          "shop": "gos"
        },
        "benelli": {
          "name": "Benelli M4",
          "cost": 120000,
          "weight": 8,
          "dura": 25,
          "minLvl": 30,
          "damage": "30-40",
          "precision": 85,
          "range": 12,
          "shots": 3,
          "shop": "gos"
        },
        "liberator": {
          "name": "Liberator mk3",
          "cost": 200000,
          "weight": 6,
          "dura": 25,
          "minLvl": 34,
          "damage": "10-20",
          "precision": 60,
          "range": 16,
          "shots": 8,
          "shop": "gos"
        },
        "spas15": {
          "name": "SPAS 15",
          "cost": 180000,
          "weight": 5,
          "dura": 25,
          "minLvl": 38,
          "damage": "30-42",
          "precision": 75,
          "range": 18,
          "shots": 3,
          "shop": "gos"
        },
        "r8": {
          "name": "Карабин R8",
          "cost": 220000,
          "weight": 8,
          "dura": 30,
          "minLvl": 40,
          "damage": "60-70",
          "precision": 100,
          "range": 22,
          "shots": 1,
          "shop": "gos"
        },
        "versamax": {
          "name": "VersaMax Tactical",
          "cost": 200000,
          "weight": 6,
          "dura": 30,
          "minLvl": 45,
          "damage": "30-40",
          "precision": 80,
          "range": 22,
          "shots": 4,
          "shop": "gos"
        },
        "mossberg": {
          "name": "Mossberg 590",
          "cost": 50,
          "weight": 6,
          "dura": 40,
          "minLvl": 20,
          "damage": "18-22",
          "precision": 70,
          "range": 12,
          "shots": 7,
          "shop": "art"
        },
        "vepr": {
          "name": "Вепрь-12",
          "cost": 50,
          "weight": 6,
          "dura": 50,
          "minLvl": 22,
          "damage": "22-42",
          "precision": 100,
          "range": 12,
          "shots": 3,
          "shop": "art"
        },
        "mag7": {
          "name": "MAG-7",
          "cost": 40,
          "weight": 7,
          "dura": 40,
          "slots": ["lh", "rh"],
          "minLvl": 25,
          "damage": "55-65",
          "precision": 82,
          "range": 7,
          "shots": 2,
          "shop": "art"
        },
        "usas12": {
          "name": "USAS-12",
          "cost": 45,
          "weight": 6,
          "dura": 50,
          "minLvl": 29,
          "damage": "35-45",
          "precision": 90,
          "range": 14,
          "shots": 3,
          "shop": "art"
        },
        "ksg": {
          "name": "Kel-Tec KSG",
          "cost": 48,
          "weight": 4,
          "dura": 60,
          "minLvl": 35,
          "damage": "38-52",
          "precision": 80,
          "range": 18,
          "shots": 3,
          "shop": "art"
        },
        "usas15": {
          "name": "USAS-15",
          "cost": 70,
          "weight": 4,
          "dura": 50,
          "minLvl": 38,
          "damage": "29-40",
          "precision": 70,
          "range": 22,
          "shots": 4,
          "shop": "art"
        },
        "uts15": {
          "name": "UTAS UTS-15",
          "cost": 70,
          "weight": 5,
          "dura": 60,
          "minLvl": 40,
          "damage": "15-20",
          "precision": 80,
          "range": 26,
          "shots": 7,
          "shop": "art"
        },
        "fabarm": {
          "name": "FABARM Tactical",
          "cost": 70,
          "weight": 5,
          "dura": 55,
          "minLvl": 45,
          "damage": "18-24",
          "precision": 80,
          "range": 28,
          "shots": 7,
          "shop": "art"
        }
      },
      "grl": {
        "rpg": {
          "name": "РПГ",
          "cost": 150000,
          "weight": 15,
          "dura": 20,
          "minLvl": 12,
          "damage": "30-70",
          "precision": 60,
          "range": 5,
          "shots": 1,
          "area": 1,
          "shop": "gos"
        },
        "glauncher": {
          "name": "Гранатомёт",
          "cost": 170000,
          "weight": 20,
          "dura": 16,
          "minLvl": 17,
          "damage": "30-60",
          "precision": 70,
          "range": 8,
          "shots": 1,
          "area": 1,
          "shop": "gos"
        },
        "grg": {
          "name": "GRG-48",
          "cost": 200000,
          "weight": 25,
          "dura": 14,
          "minLvl": 22,
          "damage": "40-70",
          "precision": 80,
          "range": 10,
          "shots": 1,
          "area": 1,
          "shop": "gos"
        },
        "paw20": {
          "name": "PAW-20",
          "cost": 180000,
          "weight": 28,
          "dura": 15,
          "minLvl": 28,
          "damage": "25-45",
          "precision": 60,
          "range": 12,
          "shots": 2,
          "area": 2,
          "shop": "gos"
        },
        "rpgu": {
          "name": "РПГ-У",
          "cost": 180000,
          "weight": 26,
          "dura": 16,
          "minLvl": 30,
          "damage": "25-60",
          "precision": 70,
          "range": 14,
          "shots": 1,
          "area": 3,
          "shop": "gos"
        },
        "grom2": {
          "name": "РПГ-16 \"Гром\"",
          "cost": 170000,
          "weight": 20,
          "dura": 20,
          "minLvl": 32,
          "damage": "50-80",
          "precision": 60,
          "range": 10,
          "shots": 1,
          "area": 1,
          "shop": "gos"
        },
        "ags30": {
          "name": "АГС-30",
          "cost": 150000,
          "weight": 28,
          "dura": 30,
          "minLvl": 35,
          "damage": "60-70",
          "precision": 70,
          "range": 16,
          "shots": 1,
          "area": 1,
          "shop": "gos"
        },
        "gm94": {
          "name": "ГМ-94",
          "cost": 120000,
          "weight": 17,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 36,
          "damage": "25-40",
          "precision": 60,
          "range": 8,
          "shots": 2,
          "area": 2,
          "shop": "gos"
        },
        "gl06": {
          "name": "GL-06 40mm",
          "cost": 130000,
          "weight": 28,
          "dura": 30,
          "slots": ["lh", "rh"],
          "minLvl": 37,
          "damage": "78-90",
          "precision": 70,
          "range": 8,
          "shots": 1,
          "area": 2,
          "shop": "gos"
        },
        "gmg": {
          "name": "HK GMG",
          "cost": 125000,
          "weight": 30,
          "dura": 30,
          "minLvl": 39,
          "damage": "95-110",
          "precision": 70,
          "range": 17,
          "shots": 1,
          "area": 2,
          "shop": "gos"
        },
        "balkan": {
          "name": "Балкан 40мм",
          "cost": 150000,
          "weight": 32,
          "dura": 30,
          "minLvl": 41,
          "damage": "105-120",
          "precision": 75,
          "range": 20,
          "shots": 1,
          "area": 2,
          "shop": "gos"
        },
        "ptrk": {
          "name": "ПТРК \"Корнет\"",
          "cost": 70000,
          "weight": 10,
          "dura": 15,
          "minLvl": 20,
          "damage": "40-50",
          "precision": 25,
          "range": 12,
          "shots": 1,
          "area": 2,
          "shop": "gos"
        },
        "milkor": {
          "name": "Milkor MGL",
          "cost": 58,
          "weight": 18,
          "dura": 40,
          "minLvl": 25,
          "damage": "50-70",
          "precision": 70,
          "range": 12,
          "shots": 1,
          "area": 2,
          "shop": "art"
        }
      },
      "grenades": {
        "rgd5": {
          "name": "РГД-5",
          "cost": 400,
          "weight": 1,
          "dura": 1,
          "minLvl": 5,
          "damage": "20-30",
          "precision": 100,
          "range": 5,
          "area": 1,
          "shop": "gos"
        },
        "grenade_f1": {
          "name": "Граната F-1",
          "cost": 700,
          "weight": 2,
          "dura": 1,
          "minLvl": 7,
          "damage": "30-50",
          "precision": 100,
          "range": 3,
          "area": 2,
          "shop": "gos"
        },
        "rgd2": {
          "name": "РГД-2",
          "cost": 900,
          "weight": 1,
          "dura": 1,
          "minLvl": 7,
          "damage": "1-3",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "lightst": {
          "name": "ОР-1Т",
          "cost": 550,
          "weight": 0,
          "dura": 1,
          "minLvl": 8,
          "damage": "1-10",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "lights": {
          "name": "ОР-1",
          "cost": 1000,
          "weight": 1,
          "dura": 1,
          "minLvl": 10,
          "damage": "1-3",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "rkg3": {
          "name": "РКГ-3",
          "cost": 3000,
          "weight": 1,
          "dura": 1,
          "minLvl": 14,
          "damage": "70-80",
          "precision": 100,
          "range": 6,
          "shop": "gos"
        },
        "mdn": {
          "name": "MDN",
          "cost": 3300,
          "weight": 1,
          "dura": 1,
          "minLvl": 17,
          "damage": "30-45",
          "precision": 100,
          "range": 5,
          "area": 3,
          "shop": "gos"
        },
        "rgd2m": {
          "name": "РГД-2М",
          "cost": 1500,
          "weight": 0,
          "dura": 1,
          "minLvl": 17,
          "damage": "5-15",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "rgo": {
          "name": "РГО-1",
          "cost": 4000,
          "weight": 1,
          "dura": 1,
          "minLvl": 19,
          "damage": "40-60",
          "precision": 100,
          "range": 6,
          "area": 2,
          "shop": "gos"
        },
        "m84": {
          "name": "M84",
          "cost": 1000,
          "weight": 0,
          "dura": 1,
          "minLvl": 20,
          "damage": "1-15",
          "precision": 100,
          "range": 16,
          "shop": "gos"
        },
        "rgn": {
          "name": "РГН",
          "cost": 4500,
          "weight": 1,
          "dura": 1,
          "minLvl": 22,
          "damage": "65-85",
          "precision": 100,
          "range": 8,
          "shop": "gos"
        },
        "emp_ir": {
          "name": "EMP-IR",
          "cost": 2600,
          "weight": 0,
          "dura": 1,
          "minLvl": 24,
          "damage": "1-15",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "fg3l": {
          "name": "Frag Grenade MK-3",
          "cost": 5100,
          "weight": 0,
          "dura": 1,
          "minLvl": 25,
          "damage": "50-100",
          "precision": 100,
          "range": 6,
          "area": 2,
          "shop": "gos"
        },
        "l83a1": {
          "name": "L83 A1 HG",
          "cost": 1000,
          "weight": 0,
          "dura": 1,
          "minLvl": 25,
          "damage": "1-15",
          "precision": 100,
          "range": 20,
          "shop": "gos"
        },
        "emp_s": {
          "name": "EMP-S",
          "cost": 3500,
          "weight": 0,
          "dura": 1,
          "minLvl": 26,
          "damage": "10-20",
          "precision": 100,
          "range": 10,
          "shop": "gos"
        },
        "m67": {
          "name": "M67",
          "cost": 5500,
          "weight": 1,
          "dura": 1,
          "minLvl": 26,
          "damage": "80-90",
          "precision": 100,
          "range": 8,
          "shop": "gos"
        },
        "m3": {
          "name": "M3",
          "cost": 5000,
          "weight": 0,
          "dura": 1,
          "minLvl": 30,
          "damage": "50-100",
          "precision": 100,
          "range": 8,
          "area": 2,
          "shop": "gos"
        },
        "hg78": {
          "name": "HG-78",
          "cost": 5000,
          "weight": 1,
          "dura": 1,
          "minLvl": 34,
          "damage": "80-120",
          "precision": 100,
          "range": 10,
          "area": 1,
          "shop": "gos"
        },
        "hg84": {
          "name": "HG-84",
          "cost": 4800,
          "weight": 1,
          "dura": 1,
          "minLvl": 36,
          "damage": "60-90",
          "precision": 100,
          "range": 12,
          "area": 1,
          "shop": "gos"
        },
        "fg6": {
          "name": "Mk-6 Frag Grenade",
          "cost": 6000,
          "weight": 1,
          "dura": 1,
          "minLvl": 36,
          "damage": "111-155",
          "precision": 100,
          "range": 10,
          "area": 1,
          "shop": "gos"
        },
        "anm14": {
          "name": "M14 Thermite",
          "cost": 5000,
          "weight": 0,
          "dura": 1,
          "minLvl": 27,
          "damage": "45-60",
          "precision": 100,
          "range": 8,
          "area": 1,
          "shop": "gos"
        },
        "m34ph": {
          "name": "M34 Ph",
          "cost": 5500,
          "weight": 1,
          "dura": 1,
          "minLvl": 31,
          "damage": "30-40",
          "precision": 100,
          "range": 8,
          "area": 2,
          "shop": "gos"
        },
        "fg7": {
          "name": "Mk-7 Frag Grenade",
          "cost": 5500,
          "weight": 1,
          "dura": 1,
          "minLvl": 42,
          "damage": "100-140",
          "precision": 100,
          "range": 12,
          "area": 1,
          "shop": "gos"
        },
        "fg8bd": {
          "name": "Mk-8 Black Dust",
          "cost": 4200,
          "weight": 0,
          "dura": 1,
          "minLvl": 43,
          "damage": "120-145",
          "precision": 100,
          "range": 16,
          "area": 2,
          "shop": "gos"
        }
      },
      "misc": {
        "rogatka": {
          "name": "Рогатка",
          "cost": 400,
          "weight": 1,
          "dura": 20,
          "minLvl": 5,
          "damage": "7-11",
          "precision": 100,
          "range": 0,
          "shots": 1,
          "shop": "gos"
        },
        "saw_airsoft": {
          "name": "SAW Airsoft MG",
          "cost": 500,
          "weight": 6,
          "dura": 3,
          "minLvl": 5,
          "damage": "2-3",
          "precision": 33,
          "range": 0,
          "shots": 22,
          "shop": "gos"
        },
        "pb_marker": {
          "name": "Пейнтбольный маркер",
          "cost": 480,
          "weight": 7,
          "dura": 3,
          "minLvl": 5,
          "damage": "7-18",
          "precision": 33,
          "range": 2,
          "shots": 3,
          "shop": "gos"
        },
        "potato2": {
          "name": "Картофелемёт #2",
          "cost": 420,
          "weight": 3,
          "dura": 3,
          "minLvl": 5,
          "damage": "3-18",
          "precision": 15,
          "range": 0,
          "shots": 10,
          "shop": "gos"
        },
        "nokia9500": {
          "name": "Nokia 9500",
          "cost": 20,
          "weight": 0,
          "dura": 40,
          "slots": ["bt", "lp"],
          "minLvl": 15,
          "shop": "art"
        },
        "fan": {
          "name": "Веер",
          "cost": 10,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "art"
        },
        "brelok": {
          "name": "Брелок",
          "cost": 10,
          "weight": 0,
          "dura": 18,
          "minLvl": 20,
          "shop": "art"
        },
        "cigar": {
          "name": "Сигара",
          "cost": 10,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "art"
        },
        "clocks": {
          "name": "Карманные часы",
          "cost": 10,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "art"
        },
        "gift_wallet": {
          "name": "Дамский кошелек",
          "cost": 20,
          "weight": 0,
          "dura": 25,
          "minLvl": 20,
          "shop": "art"
        },
        "gift_watch": {
          "name": "Наручные часы",
          "cost": 21,
          "weight": 0,
          "dura": 25,
          "minLvl": 20,
          "shop": "art"
        },
        "lighter": {
          "name": "Зажигалка",
          "cost": 10,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "art"
        },
        "n81": {
          "name": "Nokia N81",
          "cost": 30,
          "weight": 0,
          "dura": 40,
          "minLvl": 24,
          "shop": "art"
        },
        "fieldcomp": {
          "name": "Полевой компьютер",
          "cost": 20,
          "weight": 0,
          "dura": 40,
          "minLvl": 26,
          "shop": "art"
        },
        "n95": {
          "name": "Nokia N95",
          "cost": 40,
          "weight": 0,
          "dura": 40,
          "minLvl": 30,
          "shop": "art"
        },
        "saperka3": {
          "name": "Складная лопата",
          "cost": 20,
          "weight": 0,
          "dura": 50,
          "minLvl": 30,
          "shop": "art"
        },
        "attackbelt": {
          "name": "Пояс штурмовика",
          "cost": 20,
          "weight": 0,
          "dura": 40,
          "minLvl": 31,
          "shop": "art"
        },
        "ammobelt": {
          "name": "Патронташ",
          "cost": 20,
          "weight": 0,
          "dura": 40,
          "minLvl": 32,
          "shop": "art"
        },
        "watch_ganjarmani": {
          "name": "Часы Ganjarmani",
          "cost": 30,
          "weight": 0,
          "dura": 25,
          "minLvl": 33,
          "shop": "art"
        },
        "mealpack": {
          "name": "Сухой паек",
          "cost": 24,
          "weight": 0,
          "dura": 40,
          "minLvl": 36,
          "shop": "art"
        },
        "gwatch": {
          "name": "GWatch",
          "cost": 50,
          "weight": 0,
          "dura": 40,
          "minLvl": 38,
          "shop": "art"
        },
        "cbelt": {
          "name": "Кевларовый пояс",
          "cost": 24,
          "weight": 1,
          "dura": 40,
          "minLvl": 40,
          "shop": "art"
        },
        "sw_gp34": {
          "name": "ГП-34",
          "cost": 5,
          "weight": 0,
          "dura": 1,
          "minLvl": 41,
          "damage": "90-100",
          "precision": 100,
          "range": 24,
          "shots": 1,
          "area": 1,
          "shop": "art"
        },
        "ganjapad": {
          "name": "GanjaPad",
          "cost": 60,
          "weight": 0,
          "dura": 40,
          "minLvl": 42,
          "shop": "art"
        }
      },
      "armour": {
        "narmour": {
          "name": "Легкий Бронежилет",
          "cost": 550,
          "weight": 1,
          "dura": 8,
          "minLvl": 0,
          "shop": "gos"
        },
        "bronik1": {
          "name": "Бронежилет 1-го класса",
          "cost": 18000,
          "weight": 2,
          "dura": 20,
          "minLvl": 5,
          "shop": "gos"
        },
        "bronik2": {
          "name": "Бронежилет 2-го класса",
          "cost": 51000,
          "weight": 4,
          "dura": 20,
          "minLvl": 9,
          "shop": "gos"
        },
        "bronik3": {
          "name": "Броня 3 класса",
          "cost": 60000,
          "weight": 8,
          "dura": 20,
          "minLvl": 12,
          "shop": "gos"
        },
        "bronik4": {
          "name": "Броня 4 класса",
          "cost": 100000,
          "weight": 10,
          "dura": 20,
          "minLvl": 16,
          "shop": "gos"
        },
        "bronik5": {
          "name": "Броня 5 класса",
          "cost": 120000,
          "weight": 11,
          "dura": 24,
          "minLvl": 19,
          "shop": "gos"
        },
        "soarmour": {
          "name": "Spec Ops Vest",
          "cost": 110000,
          "weight": 12,
          "dura": 24,
          "minLvl": 21,
          "shop": "gos"
        },
        "bronik6": {
          "name": "Броня 6 класса",
          "cost": 130000,
          "weight": 12,
          "dura": 25,
          "minLvl": 23,
          "shop": "gos"
        },
        "carmour": {
          "name": "Кевларовая броня",
          "cost": 150000,
          "weight": 13,
          "dura": 26,
          "minLvl": 27,
          "shop": "gos"
        },
        "otv_armour": {
          "name": "OTV Armour",
          "cost": 150000,
          "weight": 13,
          "dura": 26,
          "minLvl": 31,
          "shop": "gos"
        },
        "sarmour7": {
          "name": "Бронежилет SA-7",
          "cost": 160000,
          "weight": 14,
          "dura": 26,
          "minLvl": 34,
          "shop": "gos"
        },
        "armour_alpha": {
          "name": "Бронежилет \"Альфа\"",
          "cost": 170000,
          "weight": 15,
          "dura": 27,
          "minLvl": 36,
          "shop": "gos"
        },
        "balcs": {
          "name": "Бронежилет BALCS",
          "cost": 180000,
          "weight": 14,
          "dura": 28,
          "minLvl": 38,
          "shop": "gos"
        },
        "bronik7": {
          "name": "Броня 7 класса",
          "cost": 160000,
          "weight": 13,
          "dura": 28,
          "minLvl": 41,
          "shop": "gos"
        },
        "mkt_armour": {
          "name": "Бронежилет MKT",
          "cost": 180000,
          "weight": 15,
          "dura": 30,
          "minLvl": 42,
          "shop": "gos"
        },
        "tset": {
          "name": "Титановые вставки",
          "cost": 50000,
          "weight": 1,
          "dura": 15,
          "slots": ["lp", "rp"],
          "minLvl": 14,
          "shop": "gos"
        },
        "tbelt": {
          "name": "Титановый пояс",
          "cost": 10000,
          "weight": 1,
          "dura": 10,
          "minLvl": 16,
          "shop": "gos"
        },
        "saperka": {
          "name": "Саперная лопатка",
          "cost": 80000,
          "weight": 1,
          "dura": 20,
          "minLvl": 25,
          "shop": "gos"
        },
        "saperka2": {
          "name": "Саперная лопатка #2",
          "cost": 30000,
          "weight": 0,
          "dura": 15,
          "minLvl": 35,
          "shop": "gos"
        },
        "bronik3c": {
          "name": "Легкая броня 3 класса",
          "cost": 11,
          "weight": 6,
          "dura": 60,
          "minLvl": 5,
          "shop": "art"
        },
        "bronik4c": {
          "name": "Легкая броня 4 класса",
          "cost": 38,
          "weight": 8,
          "dura": 80,
          "minLvl": 13,
          "shop": "art"
        },
        "bronik5c": {
          "name": "Легкая броня 5 класса",
          "cost": 42,
          "weight": 8,
          "dura": 70,
          "minLvl": 16,
          "shop": "art"
        },
        "bronik6c": {
          "name": "Легкая броня 6 класса",
          "cost": 45,
          "weight": 9,
          "dura": 60,
          "minLvl": 19,
          "shop": "art"
        },
        "blackhawk": {
          "name": "Бронежилет \"Blackhawk\"",
          "cost": 40,
          "weight": 9,
          "dura": 40,
          "minLvl": 22,
          "shop": "art"
        },
        "armour_p300": {
          "name": "Бронежилет P-300",
          "cost": 48,
          "weight": 10,
          "dura": 60,
          "minLvl": 25,
          "shop": "art"
        },
        "blackcell": {
          "name": "BlackCell",
          "cost": 45,
          "weight": 10,
          "dura": 50,
          "minLvl": 30,
          "shop": "art"
        },
        "rbr": {
          "name": "RBR Tactical",
          "cost": 40,
          "weight": 11,
          "dura": 40,
          "minLvl": 32,
          "shop": "art"
        },
        "armour_patrol": {
          "name": "Бронежилет \"Патруль\"",
          "cost": 50,
          "weight": 12,
          "dura": 50,
          "minLvl": 34,
          "shop": "art"
        },
        "delta5": {
          "name": "Delta 5 Tactical",
          "cost": 50,
          "weight": 13,
          "dura": 60,
          "minLvl": 36,
          "shop": "art"
        },
        "mr1_armour": {
          "name": "Броня MR-1",
          "cost": 50,
          "weight": 12,
          "dura": 60,
          "minLvl": 38,
          "shop": "art"
        },
        "delta7": {
          "name": "Delta 7 TA",
          "cost": 50,
          "weight": 11,
          "dura": 50,
          "minLvl": 40,
          "shop": "art"
        },
        "fav": {
          "name": "FAV Armour",
          "cost": 55,
          "weight": 12,
          "dura": 60,
          "minLvl": 41,
          "shop": "art"
        },
        "protector": {
          "name": "Броня «Protector»",
          "cost": 60,
          "weight": 12,
          "dura": 70,
          "minLvl": 42,
          "shop": "art"
        },
        "irlights": {
          "name": "IR Lights",
          "cost": 40,
          "weight": 0,
          "dura": 1000,
          "minLvl": 15,
          "shop": "rent"
        },
        "mask_hawster": {
          "name": "Маскхалат Hawster",
          "cost": 35,
          "weight": 0,
          "dura": 1000,
          "minLvl": 15,
          "shop": "rent"
        },
        "mask_hawster1": {
          "name": "Маскхалат Hawster",
          "cost": 10,
          "weight": 1,
          "dura": 1000,
          "minLvl": 15,
          "shop": "rent"
        },
        "nokia8800": {
          "name": "Nokia 8800",
          "cost": 45,
          "weight": 0,
          "dura": 1000,
          "minLvl": 15,
          "shop": "rent"
        },
        "nokia8800_se": {
          "name": "Nokia 8800 SE",
          "cost": 28,
          "weight": 0,
          "dura": 1000,
          "minLvl": 15,
          "shop": "rent"
        },
        "tesla_armour": {
          "name": "Броня \"Тесла\"",
          "cost": 48,
          "weight": 15,
          "dura": 5000,
          "minLvl": 25,
          "shop": "rent"
        }
      },
      "helmets": {
        "nhelmet": {
          "name": "Армейский шлем",
          "cost": 450,
          "weight": 2,
          "dura": 8,
          "minLvl": 0,
          "shop": "gos"
        },
        "helmet1": {
          "name": "Шлем 1-го класса",
          "cost": 6000,
          "weight": 1,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "helmet2": {
          "name": "Шлем 2-го класса",
          "cost": 4000,
          "weight": 1,
          "dura": 10,
          "minLvl": 6,
          "shop": "gos"
        },
        "helmet3": {
          "name": "Шлем 3-го класса",
          "cost": 35000,
          "weight": 2,
          "dura": 20,
          "minLvl": 9,
          "shop": "gos"
        },
        "helmet4": {
          "name": "Шлем 4-го класса",
          "cost": 55000,
          "weight": 3,
          "dura": 20,
          "minLvl": 16,
          "shop": "gos"
        },
        "dhelmet": {
          "name": "Десантный шлем",
          "cost": 45000,
          "weight": 3,
          "dura": 18,
          "minLvl": 18,
          "shop": "gos"
        },
        "thelmet": {
          "name": "Титановая каска",
          "cost": 40000,
          "weight": 4,
          "dura": 18,
          "minLvl": 23,
          "shop": "gos"
        },
        "m1helmet": {
          "name": "Шлем М-1",
          "cost": 60000,
          "weight": 5,
          "dura": 20,
          "minLvl": 26,
          "shop": "gos"
        },
        "pasfgt": {
          "name": "PAS Helmet",
          "cost": 92000,
          "weight": 6,
          "dura": 24,
          "minLvl": 30,
          "shop": "gos"
        },
        "mich_helmet": {
          "name": "MICH Helmet",
          "cost": 94500,
          "weight": 6,
          "dura": 25,
          "minLvl": 32,
          "shop": "gos"
        },
        "achelmet": {
          "name": "AC Helmet",
          "cost": 100500,
          "weight": 7,
          "dura": 26,
          "minLvl": 34,
          "shop": "gos"
        },
        "ma1_helmet": {
          "name": "Шлем MA-1",
          "cost": 120000,
          "weight": 7,
          "dura": 26,
          "minLvl": 36,
          "shop": "gos"
        },
        "defender": {
          "name": "Шлем \"Defender\"",
          "cost": 110000,
          "weight": 7,
          "dura": 26,
          "minLvl": 38,
          "shop": "gos"
        },
        "helmetmk7": {
          "name": "Легкий шлем Mk-7",
          "cost": 100000,
          "weight": 6,
          "dura": 28,
          "minLvl": 41,
          "shop": "gos"
        },
        "acehelmet": {
          "name": "ACE Helmet",
          "cost": 130000,
          "weight": 6,
          "dura": 30,
          "minLvl": 42,
          "shop": "gos"
        },
        "lwhelmet": {
          "name": "Шлем Land Warrior",
          "cost": 35,
          "weight": 2,
          "dura": 80,
          "minLvl": 15,
          "shop": "art"
        },
        "empires": {
          "name": "Имперский шлем",
          "cost": 50,
          "weight": 3,
          "dura": 60,
          "minLvl": 17,
          "shop": "art"
        },
        "sas_helmet": {
          "name": "Шлем SAS",
          "cost": 55,
          "weight": 2,
          "dura": 60,
          "minLvl": 20,
          "shop": "art"
        },
        "chelmet": {
          "name": "Кевларовый шлем",
          "cost": 35,
          "weight": 3,
          "dura": 35,
          "minLvl": 24,
          "shop": "art"
        },
        "spectra": {
          "name": "Шлем \"Spectra\"",
          "cost": 45,
          "weight": 4,
          "dura": 50,
          "minLvl": 27,
          "shop": "art"
        },
        "arhelmet": {
          "name": "AR Helmet",
          "cost": 39,
          "weight": 3,
          "dura": 48,
          "minLvl": 31,
          "shop": "art"
        },
        "fasthelmet": {
          "name": "F.A.S.T. Helmet",
          "cost": 44,
          "weight": 3,
          "dura": 40,
          "minLvl": 33,
          "shop": "art"
        },
        "helmetmk6": {
          "name": "Шлем Mk-6",
          "cost": 50,
          "weight": 5,
          "dura": 50,
          "minLvl": 36,
          "shop": "art"
        },
        "mpas": {
          "name": "Шлем MPAS",
          "cost": 50,
          "weight": 3,
          "dura": 50,
          "minLvl": 38,
          "shop": "art"
        },
        "g15helmet": {
          "name": "G-15 Helmet",
          "cost": 50,
          "weight": 4,
          "dura": 50,
          "minLvl": 40,
          "shop": "art"
        },
        "ksfhelmet": {
          "name": "KSF Helmet",
          "cost": 60,
          "weight": 4,
          "dura": 70,
          "minLvl": 42,
          "shop": "art"
        }
      },
      "boots": {
        "nboots": {
          "name": "Походные ботинки",
          "cost": 600,
          "weight": 1,
          "dura": 8,
          "minLvl": 0,
          "shop": "gos"
        },
        "boots": {
          "name": "Армейские ботинки",
          "cost": 7000,
          "weight": 1,
          "dura": 20,
          "minLvl": 5,
          "shop": "gos"
        },
        "heavyboots": {
          "name": "Тяжелые ботинки",
          "cost": 2000,
          "weight": 1,
          "dura": 10,
          "minLvl": 6,
          "shop": "gos"
        },
        "lowshield1": {
          "name": "Кевларовые щитки",
          "cost": 45000,
          "weight": 4,
          "dura": 20,
          "minLvl": 12,
          "shop": "gos"
        },
        "armyboots": {
          "name": "Армейские сапоги",
          "cost": 60000,
          "weight": 4,
          "dura": 22,
          "minLvl": 16,
          "shop": "gos"
        },
        "hshields": {
          "name": "Тяжелые щитки",
          "cost": 78000,
          "weight": 5,
          "dura": 24,
          "minLvl": 21,
          "shop": "gos"
        },
        "kboots": {
          "name": "Кирзовые сапоги",
          "cost": 95000,
          "weight": 5,
          "dura": 26,
          "minLvl": 26,
          "shop": "gos"
        },
        "shboots": {
          "name": "Ботинки штурмовика",
          "cost": 120000,
          "weight": 6,
          "dura": 28,
          "minLvl": 33,
          "shop": "gos"
        },
        "commboots": {
          "name": "Ботинки Коммандос",
          "cost": 110000,
          "weight": 5,
          "dura": 28,
          "minLvl": 37,
          "shop": "gos"
        },
        "desertboots": {
          "name": "Ботинки Desert Soldier",
          "cost": 121000,
          "weight": 5,
          "dura": 28,
          "minLvl": 39,
          "shop": "gos"
        },
        "warlordboots": {
          "name": "Ботинки Warlord",
          "cost": 115000,
          "weight": 5,
          "dura": 28,
          "minLvl": 41,
          "shop": "gos"
        },
        "vgboots": {
          "name": "Ботинки Vanguard",
          "cost": 110000,
          "weight": 5,
          "dura": 28,
          "minLvl": 42,
          "shop": "gos"
        },
        "lowshieldc": {
          "name": "Титановые щитки",
          "cost": 10,
          "weight": 0,
          "dura": 50,
          "minLvl": 10,
          "shop": "art"
        },
        "cboots": {
          "name": "Кевларовые сапоги",
          "cost": 20,
          "weight": 2,
          "dura": 50,
          "minLvl": 15,
          "shop": "art"
        },
        "shields_la": {
          "name": "Щитки Light Alloy",
          "cost": 25,
          "weight": 2,
          "dura": 50,
          "minLvl": 20,
          "shop": "art"
        },
        "hboots": {
          "name": "Хромовые сапоги",
          "cost": 30,
          "weight": 3,
          "dura": 50,
          "minLvl": 25,
          "shop": "art"
        },
        "dboots": {
          "name": "Десантные сапоги",
          "cost": 40,
          "weight": 4,
          "dura": 50,
          "minLvl": 31,
          "shop": "art"
        },
        "swatboots": {
          "name": "Ботинки SWAT",
          "cost": 50,
          "weight": 3,
          "dura": 50,
          "minLvl": 36,
          "shop": "art"
        },
        "cobraboots": {
          "name": "Ботинки \"Кобра\"",
          "cost": 52,
          "weight": 3,
          "dura": 52,
          "minLvl": 38,
          "shop": "art"
        },
        "officerboots": {
          "name": "Ботинки офицера",
          "cost": 54,
          "weight": 4,
          "dura": 60,
          "minLvl": 40,
          "shop": "art"
        },
        "bootspec": {
          "name": "Ботинки SpecOps",
          "cost": 60,
          "weight": 4,
          "dura": 70,
          "minLvl": 42,
          "shop": "art"
        }
      },
      "masks": {
        "nmask": {
          "name": "Маскировка",
          "cost": 300,
          "weight": 1,
          "dura": 7,
          "minLvl": 0,
          "shop": "gos"
        },
        "mask1": {
          "name": "Камуфляжный плащ",
          "cost": 20000,
          "weight": 1,
          "dura": 20,
          "minLvl": 7,
          "shop": "gos"
        },
        "mask2": {
          "name": "Камуфляж",
          "cost": 50000,
          "weight": 2,
          "dura": 20,
          "minLvl": 11,
          "shop": "gos"
        },
        "maskp": {
          "name": "Маскировочный плащ",
          "cost": 10000,
          "weight": 2,
          "dura": 10,
          "minLvl": 16,
          "shop": "gos"
        },
        "prohunter": {
          "name": "Pro-Hunter Safari",
          "cost": 25000,
          "weight": 2,
          "dura": 18,
          "minLvl": 22,
          "shop": "gos"
        },
        "woodland": {
          "name": "Woodland Camo",
          "cost": 55000,
          "weight": 2,
          "dura": 24,
          "minLvl": 28,
          "shop": "gos"
        },
        "huntercamo": {
          "name": "Охотничий камуфляж",
          "cost": 80000,
          "weight": 3,
          "dura": 30,
          "minLvl": 34,
          "shop": "gos"
        },
        "alpenflage": {
          "name": "Костюм Alpenflage",
          "cost": 100000,
          "weight": 3,
          "dura": 30,
          "minLvl": 38,
          "shop": "gos"
        },
        "alpinecamo": {
          "name": "Alpine Camo",
          "cost": 120000,
          "weight": 3,
          "dura": 30,
          "minLvl": 40,
          "shop": "gos"
        },
        "desertcamo": {
          "name": "Пустынный камуфляж",
          "cost": 150000,
          "weight": 3,
          "dura": 30,
          "minLvl": 43,
          "shop": "gos"
        },
        "maskl": {
          "name": "Лесной маскхалат",
          "cost": 20,
          "weight": 1,
          "dura": 80,
          "minLvl": 15,
          "shop": "art"
        },
        "rockycamo": {
          "name": "Rocky Camo",
          "cost": 30,
          "weight": 1,
          "dura": 45,
          "minLvl": 21,
          "shop": "art"
        },
        "mesh": {
          "name": "Mesh Ghillie Mask",
          "cost": 30,
          "weight": 1,
          "dura": 45,
          "minLvl": 27,
          "shop": "art"
        },
        "forester": {
          "name": "Маскхалат Forester-1",
          "cost": 30,
          "weight": 1,
          "dura": 40,
          "minLvl": 32,
          "shop": "art"
        },
        "jackpyke": {
          "name": "Маскхалат Jack Pyke",
          "cost": 32,
          "weight": 1,
          "dura": 45,
          "minLvl": 36,
          "shop": "art"
        },
        "swatcamo": {
          "name": "SWAT Camo",
          "cost": 38,
          "weight": 1,
          "dura": 48,
          "minLvl": 40,
          "shop": "art"
        },
        "deltamask": {
          "name": "Камуфляж \"Delta\"",
          "cost": 40,
          "weight": 2,
          "dura": 50,
          "minLvl": 43,
          "shop": "art"
        }
      },
      "wear": {
        "glasses1": {
          "name": "Защитные очки",
          "cost": 9000,
          "weight": 0,
          "dura": 10,
          "minLvl": 12,
          "shop": "gos"
        },
        "svision": {
          "name": "Очки S-Vision",
          "cost": 80000,
          "weight": 1,
          "dura": 20,
          "minLvl": 14,
          "shop": "gos"
        },
        "irt7": {
          "name": "Тепловизор IRT-7",
          "cost": 80000,
          "weight": 1,
          "dura": 18,
          "minLvl": 17,
          "shop": "gos"
        },
        "ivision": {
          "name": "i-Vision",
          "cost": 100000,
          "weight": 2,
          "dura": 40,
          "minLvl": 28,
          "shop": "gos"
        },
        "dvs100": {
          "name": "Тепловизор DVS-100",
          "cost": 100000,
          "weight": 3,
          "dura": 40,
          "minLvl": 35,
          "shop": "gos"
        },
        "nl90": {
          "name": "NL 90",
          "cost": 110000,
          "weight": 4,
          "dura": 40,
          "minLvl": 38,
          "shop": "gos"
        },
        "lucie": {
          "name": "Thales Lucie II D",
          "cost": 115000,
          "weight": 4,
          "dura": 40,
          "minLvl": 40,
          "shop": "gos"
        },
        "pvs15": {
          "name": "Тепловизор PVS-15",
          "cost": 120000,
          "weight": 5,
          "dura": 40,
          "minLvl": 43,
          "shop": "gos"
        },
        "ilight": {
          "name": "Очки iLight",
          "cost": 20,
          "weight": 1,
          "dura": 40,
          "minLvl": 16,
          "shop": "art"
        },
        "deye": {
          "name": "Digital Eye",
          "cost": 30,
          "weight": 2,
          "dura": 40,
          "minLvl": 24,
          "shop": "art"
        },
        "nighthawk": {
          "name": "NightHawk IR",
          "cost": 64,
          "weight": 5,
          "dura": 50,
          "minLvl": 30,
          "shop": "art"
        },
        "atn14": {
          "name": "ATN FIITS 14",
          "cost": 65,
          "weight": 4,
          "dura": 50,
          "minLvl": 35,
          "shop": "art"
        },
        "edge": {
          "name": "Pulsar Edge",
          "cost": 60,
          "weight": 5,
          "dura": 50,
          "minLvl": 38,
          "shop": "art"
        },
        "nvg1": {
          "name": "NVG1 Pro",
          "cost": 53,
          "weight": 6,
          "dura": 50,
          "minLvl": 40,
          "shop": "art"
        },
        "pvs21": {
          "name": "Тепловизор PVS-21",
          "cost": 45,
          "weight": 5,
          "dura": 50,
          "minLvl": 43,
          "shop": "art"
        }
      },
      "phones": {
        "nokia3310": {
          "name": "Nokia 3310",
          "cost": 3950,
          "weight": 0,
          "dura": 20,
          "slots": ["bt", "lp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "erict29": {
          "name": "Ericsson T29",
          "cost": 3700,
          "weight": 0,
          "dura": 20,
          "slots": ["bt", "lp"],
          "minLvl": 5,
          "shop": "gos"
        },
        "sme45": {
          "name": "Siemens ME45",
          "cost": 5120,
          "weight": 0,
          "dura": 20,
          "slots": ["bt", "lp"],
          "minLvl": 5,
          "shop": "gos"
        },
        "nokia8910": {
          "name": "Nokia 8910",
          "cost": 25000,
          "weight": 0,
          "dura": 20,
          "slots": ["bt", "lp"],
          "minLvl": 7,
          "shop": "gos"
        },
        "st300": {
          "name": "Sony T300",
          "cost": 9900,
          "weight": 0,
          "dura": 10,
          "slots": ["bt", "lp"],
          "minLvl": 14,
          "shop": "gos"
        },
        "px11": {
          "name": "Panasonic X11",
          "cost": 30000,
          "weight": 0,
          "dura": 15,
          "slots": ["bt", "lp"],
          "minLvl": 16,
          "shop": "gos"
        },
        "nokia7200": {
          "name": "Nokia 7200",
          "cost": 29000,
          "weight": 0,
          "dura": 15,
          "slots": ["bt", "lp"],
          "minLvl": 16,
          "shop": "gos"
        },
        "camobelt": {
          "name": "Камуфляжный пояс",
          "cost": 21000,
          "weight": 0,
          "dura": 15,
          "minLvl": 20,
          "shop": "gos"
        },
        "nokia6110": {
          "name": "Nokia 6110",
          "cost": 50000,
          "weight": 0,
          "dura": 25,
          "minLvl": 25,
          "shop": "gos"
        },
        "carryingvest": {
          "name": "Разгрузочный жилет",
          "cost": 75000,
          "weight": 0,
          "dura": 18,
          "minLvl": 28,
          "shop": "gos"
        },
        "n82": {
          "name": "Nokia N82",
          "cost": 80000,
          "weight": 0,
          "dura": 27,
          "minLvl": 31,
          "shop": "gos"
        },
        "binocular1": {
          "name": "Туристический бинокль",
          "cost": 91000,
          "weight": 1,
          "dura": 25,
          "minLvl": 32,
          "shop": "gos"
        },
        "binocular2": {
          "name": "Полевой бинокль",
          "cost": 120000,
          "weight": 1,
          "dura": 30,
          "minLvl": 35,
          "shop": "gos"
        },
        "watch_com": {
          "name": "Часы Бригадирские",
          "cost": 115000,
          "weight": 0,
          "dura": 20,
          "minLvl": 35,
          "shop": "gos"
        },
        "engineerbelt": {
          "name": "Пояс инженера",
          "cost": 110000,
          "weight": 1,
          "dura": 26,
          "minLvl": 38,
          "shop": "gos"
        },
        "synergic": {
          "name": "Synergic W-1",
          "cost": 120000,
          "weight": 0,
          "dura": 25,
          "minLvl": 38,
          "shop": "gos"
        },
        "mercbelt": {
          "name": "Пояс наемника",
          "cost": 120000,
          "weight": 0,
          "dura": 30,
          "minLvl": 39,
          "shop": "gos"
        },
        "greenbook": {
          "name": "Greenbook",
          "cost": 150000,
          "weight": 0,
          "dura": 25,
          "minLvl": 42,
          "shop": "gos"
        }
      },
      "transport": {
        "backpack": {
          "name": "Легкий рюкзак",
          "cost": 16000,
          "weight": 4,
          "dura": 15,
          "minLvl": 0,
          "shop": "gos"
        },
        "bigbackpack": {
          "name": "Большой рюкзак",
          "cost": 20000,
          "weight": 8,
          "dura": 16,
          "minLvl": 18,
          "shop": "gos"
        },
        "gps": {
          "name": "GPS Навигатор",
          "cost": 17000,
          "weight": 0,
          "dura": 15,
          "slots": ["bt", "lp", "rp", "ch"],
          "minLvl": 0,
          "shop": "gos"
        },
        "bike": {
          "name": "Велосипед",
          "cost": 3000,
          "weight": 0,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "motobike": {
          "name": "Мотоцикл",
          "cost": 15000,
          "weight": 0,
          "dura": 30,
          "minLvl": 0,
          "shop": "gos"
        },
        "celica": {
          "name": "Toyota Celica",
          "cost": 20000,
          "weight": 0,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "kamaz": {
          "name": "Камаз",
          "cost": 110000,
          "weight": 13,
          "dura": 25,
          "minLvl": 0,
          "shop": "gos"
        },
        "lexus": {
          "name": "Lexus GX470",
          "cost": 150000,
          "weight": 3,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "boat1": {
          "name": "Шлюпка",
          "cost": 5000,
          "weight": 0,
          "dura": 100,
          "minLvl": 0,
          "shop": "gos"
        },
        "yacht1": {
          "name": "Яхта",
          "cost": 10000,
          "weight": 0,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "boat2": {
          "name": "Катер",
          "cost": 20000,
          "weight": 0,
          "dura": 20,
          "minLvl": 0,
          "shop": "gos"
        },
        "parom": {
          "name": "Морской паром",
          "cost": 140000,
          "weight": 0,
          "dura": 100,
          "minLvl": 0,
          "shop": "gos"
        },
        "cessna": {
          "name": "Cessna 182",
          "cost": 100000,
          "weight": 0,
          "dura": 25,
          "minLvl": 37,
          "shop": "gos"
        },
        "h1": {
          "name": "Hummer H1",
          "cost": 80000,
          "weight": 5,
          "dura": 30,
          "minLvl": 25,
          "shop": "gos"
        },
        "mack": {
          "name": "Грузовик Mack",
          "cost": 70000,
          "weight": 20,
          "dura": 25,
          "minLvl": 20,
          "shop": "gos"
        },
        "virago": {
          "name": "Yamaha Virago",
          "cost": 75000,
          "weight": 0,
          "dura": 25,
          "minLvl": 35,
          "shop": "gos"
        },
        "slr": {
          "name": "Mercedes SLR",
          "cost": 20,
          "weight": 0,
          "dura": 80,
          "minLvl": 0,
          "shop": "art"
        },
        "apache": {
          "name": "Вертолёт Apache",
          "cost": 30,
          "weight": 0,
          "dura": 60,
          "minLvl": 0,
          "shop": "art"
        },
        "mi8": {
          "name": "Вертолёт МИ-8",
          "cost": 40,
          "weight": 30,
          "dura": 60,
          "minLvl": 0,
          "shop": "art"
        },
        "cadillac": {
          "name": "Cadillac DTSL",
          "cost": 35,
          "weight": 0,
          "dura": 50,
          "minLvl": 30,
          "shop": "art"
        },
        "chinook": {
          "name": "CH-47 \"Chinook\"",
          "cost": 50,
          "weight": 60,
          "dura": 50,
          "minLvl": 30,
          "shop": "art"
        },
        "harley": {
          "name": "Harley-Davidson Road King",
          "cost": 25,
          "weight": 0,
          "dura": 50,
          "minLvl": 35,
          "shop": "art"
        }
      },
      "flowers": {
        "buket1": {
          "name": "Букет \"Нежность\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket2": {
          "name": "Красные Розы",
          "cost": 30000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket3": {
          "name": "Букет \"Волшебство\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket4": {
          "name": "Букет \"Оранжевый рассвет\"",
          "cost": 35000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket5": {
          "name": "Букет \"Звездочка\"",
          "cost": 15000,
          "weight": 0,
          "dura": 4,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket6": {
          "name": "Букет \"Снежинка\"",
          "cost": 30000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket7": {
          "name": "Букет \"Дружок\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket8": {
          "name": "Букет \"Искренность\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket9": {
          "name": "Букет \"Синий аромат\"",
          "cost": 20000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket10": {
          "name": "Букет \"Привет из прошлого\"",
          "cost": 35000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket11": {
          "name": "Весенний букет",
          "cost": 40000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket12": {
          "name": "Букет \"Царица\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket13": {
          "name": "Букет \"Весенняя неожиданность\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket14": {
          "name": "Букет \"Солнце\"",
          "cost": 43000,
          "weight": 0,
          "dura": 7,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket15": {
          "name": "Букет \"Притяжение\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket16": {
          "name": "Букет \"Поляна\"",
          "cost": 29000,
          "weight": 0,
          "dura": 4,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket17": {
          "name": "Полевые цветы",
          "cost": 27000,
          "weight": 0,
          "dura": 4,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket18": {
          "name": "Букет \"Розовое приключение\"",
          "cost": 41000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket19": {
          "name": "Букет \"Цветочное безумие\"",
          "cost": 26000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket20": {
          "name": "Белые тюльпаны",
          "cost": 25000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket21": {
          "name": "Букет \"Веселый день\"",
          "cost": 20000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket22": {
          "name": "Букет \"Восстание цветов\"",
          "cost": 40000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket23": {
          "name": "Букет \"Веселуха\"",
          "cost": 15000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket24": {
          "name": "Букет \"Солнечный круг\"",
          "cost": 45000,
          "weight": 0,
          "dura": 7,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket25": {
          "name": "Букет \"Воспоминание\"",
          "cost": 27000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket26": {
          "name": "Букет \"Ожидание лета\"",
          "cost": 26000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket27": {
          "name": "Букет \"Безумные розы\"",
          "cost": 33000,
          "weight": 0,
          "dura": 7,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket28": {
          "name": "Букет \"Цветочный зонт\"",
          "cost": 21000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket29": {
          "name": "Букет \"Для красотки\"",
          "cost": 40000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket30": {
          "name": "Букет \"Цветочный взрыв\"",
          "cost": 32000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket31": {
          "name": "Букет \"Без слов\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket32": {
          "name": "Букет \"Сладкая Ягодка\"",
          "cost": 20000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket33": {
          "name": "Букет \"Весенний аромат\"",
          "cost": 18000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket34": {
          "name": "Букет \"Скромный намёк\"",
          "cost": 44000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket35": {
          "name": "Букет \"Доброе утро\"",
          "cost": 27000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket36": {
          "name": "Букет \"Дружеский привет\"",
          "cost": 18000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket37": {
          "name": "Букет \"Чистое небо\"",
          "cost": 35000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket38": {
          "name": "Букет \"Надежда\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket39": {
          "name": "Букет \"Огонь желания\"",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket40": {
          "name": "Букет \"Солнечный лучик\"",
          "cost": 31000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        },
        "buket41": {
          "name": "Букет \"Лучшие чувства\"",
          "cost": 25000,
          "weight": 0,
          "dura": 6,
          "slots": ["rh", "bt", "rp"],
          "minLvl": 0,
          "shop": "gos"
        }
      },
      "gifts": {
        "gift_teddybear": {
          "name": "Плюшевый медведь",
          "cost": 80000,
          "weight": 0,
          "dura": 12,
          "minLvl": 0,
          "shop": "gos"
        },
        "gift_cake": {
          "name": "Шоколадный торт",
          "cost": 40000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "bullet": {
          "name": "Сувенирный патрон",
          "cost": 100000,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "gos"
        },
        "flask": {
          "name": "Фляга с виски",
          "cost": 100000,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "gos"
        },
        "cards": {
          "name": "Сувенирная колода",
          "cost": 100000,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "gos"
        },
        "compass": {
          "name": "Компас",
          "cost": 100000,
          "weight": 0,
          "dura": 20,
          "minLvl": 20,
          "shop": "gos"
        },
        "abvgd": {
          "name": "Весёлый Букварь",
          "cost": 100,
          "weight": 1,
          "dura": 1,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy1": {
          "name": "Добрый заяц",
          "cost": 25000,
          "weight": 1,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy2": {
          "name": "Улетевшая ворона",
          "cost": 31000,
          "weight": 1,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy3": {
          "name": "Розовые лапы",
          "cost": 28000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy4": {
          "name": "Котопарочка",
          "cost": 35000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy5": {
          "name": "Довольный тигр",
          "cost": 30000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy6": {
          "name": "Синий осёл",
          "cost": 27000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy7": {
          "name": "Хитрая белка",
          "cost": 25000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy8": {
          "name": "Поющий лев",
          "cost": 33000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy9": {
          "name": "Котёнок",
          "cost": 29000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy10": {
          "name": "Полосатый тигр",
          "cost": 31000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        },
        "toy11": {
          "name": "Весёлый питон",
          "cost": 37000,
          "weight": 0,
          "dura": 5,
          "minLvl": 0,
          "shop": "gos"
        }
      },
      "snipe": {
        "barret": {
          "name": "Barret M99",
          "cost": 40,
          "weight": 4,
          "dura": 50,
          "minLvl": 15,
          "damage": "80-85",
          "precision": 100,
          "range": 18,
          "shots": 1,
          "shop": "art"
        },
        "bfg": {
          "name": "BFG-50",
          "cost": 50,
          "weight": 4,
          "dura": 60,
          "minLvl": 19,
          "damage": "90-95",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "art"
        },
        "tactical600": {
          "name": "Tactical M-600",
          "cost": 50,
          "weight": 4,
          "dura": 50,
          "minLvl": 24,
          "damage": "100-115",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "art"
        },
        "pgm": {
          "name": "PGM Mini-Hecate .338",
          "cost": 45,
          "weight": 4,
          "dura": 60,
          "minLvl": 17,
          "damage": "80-90",
          "precision": 100,
          "range": 18,
          "shots": 1,
          "shop": "art"
        },
        "m89sr": {
          "name": "TEI M89-SR",
          "cost": 45,
          "weight": 4,
          "dura": 50,
          "minLvl": 18,
          "damage": "85-95",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "art"
        },
        "m107": {
          "name": "Barrett M107",
          "cost": 50,
          "weight": 4,
          "dura": 45,
          "minLvl": 21,
          "damage": "95-105",
          "precision": 100,
          "range": 20,
          "shots": 1,
          "shop": "art"
        },
        "vssk": {
          "name": "ВССК \"Выхлоп\"",
          "cost": 50,
          "weight": 6,
          "dura": 50,
          "minLvl": 28,
          "damage": "110-120",
          "precision": 100,
          "range": 22,
          "shots": 1,
          "shop": "art"
        },
        "rt20": {
          "name": "RT-20 Silent Shot",
          "cost": 74,
          "weight": 6,
          "dura": 60,
          "minLvl": 30,
          "damage": "120-130",
          "precision": 100,
          "range": 22,
          "shots": 1,
          "shop": "art"
        },
        "cs5": {
          "name": "McMillan CS5",
          "cost": 74,
          "weight": 6,
          "dura": 60,
          "minLvl": 33,
          "damage": "125-135",
          "precision": 100,
          "range": 22,
          "shots": 1,
          "shop": "art"
        },
        "barret_xm500": {
          "name": "Barret XM500",
          "cost": 80,
          "weight": 6,
          "dura": 62,
          "minLvl": 34,
          "damage": "130-140",
          "precision": 100,
          "range": 24,
          "shots": 1,
          "shop": "art"
        },
        "m85": {
          "name": "Parker-Hale M-85",
          "cost": 80,
          "weight": 7,
          "dura": 55,
          "minLvl": 37,
          "damage": "135-145",
          "precision": 100,
          "range": 26,
          "shots": 1,
          "shop": "art"
        },
        "steyr_ste": {
          "name": "Steyr Scout Tactical",
          "cost": 80,
          "weight": 6,
          "dura": 50,
          "minLvl": 39,
          "damage": "130-150",
          "precision": 100,
          "range": 28,
          "shots": 1,
          "shop": "art"
        },
        "rangemaster": {
          "name": "RPA Rangemaster",
          "cost": 72,
          "weight": 6,
          "dura": 50,
          "minLvl": 41,
          "damage": "80-90",
          "precision": 100,
          "range": 28,
          "shots": 2,
          "shop": "art"
        },
        "mauser93": {
          "name": "Mauser SR-93",
          "cost": 75,
          "weight": 8,
          "dura": 50,
          "minLvl": 43,
          "damage": "145-160",
          "precision": 100,
          "range": 30,
          "shots": 1,
          "shop": "art"
        },
        "ar10": {
          "name": "Armalite AR-10",
          "cost": 78,
          "weight": 6,
          "dura": 55,
          "minLvl": 44,
          "damage": "130-150",
          "precision": 100,
          "range": 28,
          "shots": 1,
          "shop": "art"
        },
        "thor": {
          "name": "Thor M408",
          "cost": 70,
          "weight": 8,
          "dura": 55,
          "minLvl": 45,
          "damage": "160-180",
          "precision": 100,
          "range": 32,
          "shots": 1,
          "shop": "art"
        },
        "awm": {
          "name": "Arctic Warfare Magnum",
          "cost": 70,
          "weight": 7,
          "dura": 60,
          "minLvl": 46,
          "damage": "90-100",
          "precision": 100,
          "range": 34,
          "shots": 2,
          "shop": "art"
        },
        "blaser_light": {
          "name": "Blaser Light",
          "cost": 10,
          "weight": 2,
          "dura": 5000,
          "minLvl": 15,
          "damage": "190-200",
          "precision": 100,
          "range": 30,
          "shots": 1,
          "shop": "rent"
        },
        "blaser_93": {
          "name": "Blaser 93",
          "cost": 50,
          "weight": 2,
          "dura": 5000,
          "minLvl": 15,
          "damage": "190-200",
          "precision": 100,
          "range": 30,
          "shots": 1,
          "shop": "rent"
        },
        "blaser-t": {
          "name": "Blaser Tactical",
          "cost": 60,
          "weight": 2,
          "dura": 5000,
          "minLvl": 25,
          "damage": "185-195",
          "precision": 100,
          "range": 32,
          "shots": 1,
          "shop": "rent"
        },
        "sharpshooter": {
          "name": "SharpShooter L129A1",
          "cost": 68,
          "weight": 2,
          "dura": 5000,
          "minLvl": 38,
          "damage": "195-200",
          "precision": 100,
          "range": 36,
          "shots": 1,
          "shop": "rent"
        }
      },
      "drugs": {
        "ganjacola": {
          "name": "Ганжа-кола",
          "cost": 2,
          "weight": 0,
          "dura": 3,
          "damage": "5-20",
          "precision": 100,
          "range": 10,
          "shots": 1,
          "area": 1,
          "shop": "art"
        },
        "mentats": {
          "name": "Ментаты",
          "cost": 2,
          "weight": 0,
          "dura": 3,
          "shop": "art"
        },
        "minimedikit": {
          "name": "Мини-аптечка",
          "cost": 2,
          "weight": 0,
          "dura": 4,
          "minLvl": 0,
          "shop": "art"
        },
        "medikit": {
          "name": "Аптечка",
          "cost": 5,
          "weight": 0,
          "dura": 15,
          "minLvl": 0,
          "shop": "art"
        },
        "bigmedikit": {
          "name": "Большая аптечка",
          "cost": 25,
          "weight": 0,
          "dura": 100,
          "minLvl": 0,
          "shop": "art"
        }
      }
    }
  });
})(jQuery, __panel);
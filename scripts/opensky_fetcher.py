import json
import csv
import sys
from pathlib import Path

try:
    from opensky_api import OpenSkyApi, TokenManager
except ImportError:
    print("Please install opensky_api first: pip install opensky-api")
    sys.exit(1)

def load_aircraft_database(csv_path):
    """Loads the aircraft database into a dictionary keyed by ICAO24 hex code."""
    db = {}
    if not Path(csv_path).exists():
        print(f"Warning: Aircraft database not found at {csv_path}")
        return db
        
    print(f"Loading aircraft database from {csv_path}...")
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            icao24 = row.get('icao24', '').strip().lower()
            if icao24:
                db[icao24] = row
    print(f"Loaded {len(db)} aircraft records.")
    return db

def main():
    credentials_path = Path("data/credentials.json")
    db_path = Path("data/aircraftDatabase-2024-04.csv")
    
    # 1. Load Aircraft Database
    aircraft_db = load_aircraft_database(db_path)
    
    # 2. Authenticate with OpenSky
    if credentials_path.exists():
        print(f"Authenticating with {credentials_path}...")
        try:
            tm = TokenManager.from_json_file(str(credentials_path))
            api = OpenSkyApi(token_manager=tm)
        except Exception as e:
            # Fallback if the TokenManager class signature differs or requires different json structure
            with open(credentials_path) as f:
                creds = json.load(f)
            api = OpenSkyApi(client_id=creds.get('clientId'), client_secret=creds.get('clientSecret'))
    else:
        print("Warning: credentials.json not found, proceeding anonymously (strict rate limits apply).")
        api = OpenSkyApi()
        
    # 3. Retrieve Live State Vectors (e.g., bounding box for a region or all states)
    print("Fetching live state vectors from OpenSky...")
    states = api.get_states()
    
    if states and states.states:
        print(f"Retrieved {len(states.states)} live flights.")
        print("-" * 80)
        
        # Display the first 10 flights, augmented with aircraft DB info
        for s in states.states[:10]:
            icao24 = s.icao24
            callsign = s.callsign.strip() if s.callsign else "N/A"
            
            # Lookup in database
            ac_info = aircraft_db.get(icao24, {})
            model = ac_info.get('model', 'Unknown Model')
            manufacturer = ac_info.get('manufacturername', 'Unknown Mfg')
            owner = ac_info.get('owner', 'Unknown Owner')
            
            print(f"Flight {callsign} (ICAO: {icao24})")
            print(f"  Location: {s.latitude}, {s.longitude} | Alt: {s.baro_altitude}m | Vel: {s.velocity}m/s")
            print(f"  Aircraft: {manufacturer} {model} | Owner: {owner}")
            print("-" * 80)
    else:
        print("No state vectors retrieved.")

if __name__ == '__main__':
    main()

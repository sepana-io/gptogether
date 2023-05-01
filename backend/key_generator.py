from utility.cryptography_utils import Fernet

if __name__ == "__main__":
    print("Generating Encrypting key!")
    print(f"The key is: '{Fernet.generate_key().decode()}'")
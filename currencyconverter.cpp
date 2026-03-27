#include<iostream>
#include<string>
#include<map>
#include<fstream>
using namespace std;

class currencyConverter{
    private:
    string sourceCurrency;
    string targetCurrency;
    double sourceCurrencyValue;
    double targetCurrencyValue;
    double Amount;
    
    public:
    //Constructor to assign the value
    currencyConverter(string srccrnc, string trgtcrnc, double source, double target, double amt) {
        sourceCurrency = srccrnc;
        targetCurrency = trgtcrnc;
        sourceCurrencyValue = source;
        targetCurrencyValue = target;
        Amount = amt;
    }

    //Function to convert the currency 
    double exchange(){
    double convertedAmount;
    convertedAmount = (targetCurrencyValue/sourceCurrencyValue)*Amount;
    return convertedAmount;
    }

    //Function to display the convertedAmount
    void display(){
        cout<<Amount<<" "<<sourceCurrency<<" = "<<exchange()<<" "<<targetCurrency<<endl;
    }
    
};

class currencyRates{
    private:
    fstream currency;
    public:
    currencyRates(const string& filename){
        currency.open(filename, ios::in);
        if(!currency.is_open()){
            cerr<<"Failed to open file: "<<filename<<endl;
        }
    }

    //Function to read the value of specific currency from the file
    double getCurrencyValue(const string& code){
        if(!currency.is_open()){
            cerr<<"File is not open!"<<endl;
            return 0.0;
        }

        //Reset file pointer to the beginning
        currency.clear();
        currency.seekg(0, ios::beg);

        string line;
        while(getline(currency, line)){
            size_t pos = line.find(" = ");
            if(pos != string::npos){
                string currencyCode = line.substr(0, pos);
                double value = stod(line.substr(pos + 3));
                if(currencyCode == code){
                    return value;
                }
            }
        }
        cerr<<"Currency code "<<code<<" not found in file!"<<endl;
        return 0.0;
    }
    ~currencyRates(){
        if(currency.is_open()){
            currency.close();
        }
    }
};

int main(){
    double amount;
    string source, target;
    map<string, int> currencyCode;
    currencyCode["AUD"];
    currencyCode["CAD"];
    currencyCode["CNY"];
    currencyCode["EUR"];
    currencyCode["INR"];
    currencyCode["JPY"];
    currencyCode["NPR"];
    currencyCode["KRW"];
    currencyCode["AED"];
    currencyCode["USD"];

    //Displaying available currencies
    cout<<"Available currency to convert: \n";
    cout<<"Australian Dollar            :[AUD]\n";
    cout<<"Canadian Dollar              :[CAD]\n";
    cout<<"Chinese Yuan                 :[CNY]\n";
    cout<<"EURO                         :[EUR]\n";
    cout<<"Indian Rupee                 :[INR]\n";
    cout<<"Japanese Yen                 :[JPY]\n";
    cout<<"Nepalese Rupee               :[NPR]\n";
    cout<<"South Korean Won             :[KRW]\n";
    cout<<"United Arab Emirates Dhiram  :[AED]\n";
    cout<<"United States Dollar         :[USD]\n";

    //Input for amount, source currency, target currency
    cout<<"Enter the source currency code (e.g., USD): "; cin>>source;
    cout<<"Enter the target currency code (e.g., EUR): "; cin>>target;
    cout<<"Enter the amount to convert: "; cin>>amount;
    
    //Validate currency codes
    if(currencyCode.find(source) == currencyCode.end() || currencyCode.find(target) == currencyCode.end()){
        cout<<"Invalid currency code!"<<endl;
        return 1;
    }

    //Read currency values from file
    currencyRates rates("currencyrates.txt");
    double sourceCurrencyValue = rates.getCurrencyValue(source);
    double targetCurrencyValue = rates.getCurrencyValue(target);

    //Validate retrieved rates
    if (sourceCurrencyValue == 0.0 || targetCurrencyValue == 0.0) {
        cout << "Unable to perform conversion due to invalid currency values." << endl;
        return 1;
    }

    //Object which call the constructor
    currencyConverter converter(source, target, sourceCurrencyValue, targetCurrencyValue, amount);
    converter.display();

    return 0;
}

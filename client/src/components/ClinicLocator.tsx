import React, { useState } from 'react';
import { MapPin, Phone, Search } from 'lucide-react';

const ClinicLocator: React.FC = () => {
  const [search, setSearch] = useState('');

  const clinics = [
    { name: 'University Teaching Hospital (UTH)', address: 'Nationalist Rd, Lusaka 10101', phone: '+260-211-254-131' },
    { name: 'Lusaka South Multi-Facility Hospital', address: 'Kafue Rd, Lusaka', phone: '+260-211-844-000' },
    { name: 'Ndola Teaching Hospital', address: 'Itawa Rd, Ndola 10100', phone: '+260-212-614-100' },
    { name: 'Kitwe Teaching Hospital', address: 'Independence Ave, Kitwe 21400', phone: '+260-212-228-677' },
    { name: 'Levy Mwanawasa Hospital', address: 'Great East Rd, Lusaka', phone: '+260-211-255-022' },
    { name: 'Kabwe General Hospital', address: 'Broadway, Kabwe 10101', phone: '+260-215-221-638' },
    { name: 'Livingstone General Hospital', address: 'Mosi-oa-Tunya Rd, Livingstone', phone: '+260-213-320-722' },
    { name: 'Chipata General Hospital', address: 'Independence Ave, Chipata', phone: '+260-216-221-655' },
    { name: 'Solwezi General Hospital', address: 'Kyafukuma Rd, Solwezi', phone: '+260-218-821-249' },
    { name: 'Kasama General Hospital', address: 'Luwingu Rd, Kasama', phone: '+260-214-221-356' },
    { name: 'Monze Mission Hospital', address: 'Hospital Rd, Monze', phone: '+260-213-261-139' },
    { name: 'St. Francis Hospital Katete', address: 'Mission Rd, Katete', phone: '+260-216-240-005' },
  ];

  // Filter clinics based on search
  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(search.toLowerCase()) ||
    clinic.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card dark:bg-dark-card p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg border border-border dark:border-dark-border max-w-7xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-text dark:text-dark-text text-center lg:text-left">
        Find a Clinic Near You
      </h2>
      
      {/* Search Input */}
      <div className="relative mb-6 sm:mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Search size={20} className="sm:w-5 sm:h-5 text-muted dark:text-dark-muted" />
        </div>
        <input
          type="text"
          placeholder="Search by clinic name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 rounded-lg bg-background dark:bg-dark-background border border-border dark:border-dark-border text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base sm:text-lg transition-colors placeholder:text-sm sm:placeholder:text-base"
        />
      </div>

      {/* Results Count */}
      {search && (
        <div className="mb-4 text-sm text-muted dark:text-dark-muted">
          {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Clinic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic, index) => (
            <div 
              key={index} 
              className="p-4 sm:p-5 lg:p-6 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group w-full"
            >
              {/* Clinic Name */}
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-primary-100 dark:bg-primary-900 rounded-lg mr-3 sm:mr-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                  <MapPin size={20} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-text dark:text-dark-text leading-tight break-words">
                    {clinic.name}
                  </h3>
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <p className="text-sm sm:text-base text-muted dark:text-dark-muted leading-relaxed break-words">
                  {clinic.address}
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center mb-4">
                <Phone size={16} className="mr-2 sm:mr-3 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                <a 
                  href={`tel:${clinic.phone}`}
                  className="text-sm sm:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors underline-offset-2 hover:underline break-all"
                >
                  {clinic.phone}
                </a>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border dark:border-dark-border">
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  Get Directions
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <MapPin size={48} className="mx-auto text-muted dark:text-dark-muted mb-4" />
            <h3 className="text-lg font-medium text-text dark:text-dark-text mb-2">
              No clinics found
            </h3>
            <p className="text-muted dark:text-dark-muted">
              {search ? `No clinics match "${search}"` : 'No clinics available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicLocator;
